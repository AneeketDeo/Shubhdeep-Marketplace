import { NextRequest, NextResponse } from 'next/server';
import { read, utils } from 'xlsx';
import { bulkCreateProducts } from '@/lib/actions/admin';
import { getCategories } from '@/lib/actions/products';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'buffer' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = utils.sheet_to_json(worksheet, { raw: false });

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty or invalid' },
        { status: 400 }
      );
    }

    // Get all categories for mapping
    const categories = await getCategories();
    const categoryMap = new Map(
      categories.map((cat) => [cat.name.toLowerCase().trim(), cat.id])
    );

    // Validate and transform data
    const products: Array<{
      title: string;
      description: string;
      price: number;
      stock: number;
      category_id: string;
      images: string[];
    }> = [];

    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNum = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

      // Extract and validate fields (case-insensitive column matching)
      const title = String(row.title || row.Title || row.TITLE || '').trim();
      const description = String(row.description || row.Description || row.DESCRIPTION || '').trim();
      const priceStr = String(row.price || row.Price || row.PRICE || '0').trim();
      const stockStr = String(row.stock || row.Stock || row.STOCK || '0').trim();
      const categoryName = String(row.category || row.Category || row.CATEGORY || row.category_id || row.Category_ID || row.CATEGORY_ID || '').trim();

      // Validate required fields
      if (!title) {
        errors.push(`Row ${rowNum}: Title is required`);
        continue;
      }

      if (!description) {
        errors.push(`Row ${rowNum}: Description is required`);
        continue;
      }

      // Parse price
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: Invalid price "${priceStr}"`);
        continue;
      }

      // Parse stock
      const stock = parseInt(stockStr, 10);
      if (isNaN(stock) || stock < 0) {
        errors.push(`Row ${rowNum}: Invalid stock "${stockStr}"`);
        continue;
      }

      // Find category
      let categoryId = categoryName;
      
      // If categoryName is not a UUID, try to find by name
      if (!categoryName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const foundCategory = categoryMap.get(categoryName.toLowerCase());
        if (!foundCategory) {
          errors.push(`Row ${rowNum}: Category "${categoryName}" not found`);
          continue;
        }
        categoryId = foundCategory;
      } else {
        // Validate UUID exists in categories
        const categoryExists = categories.some((cat) => cat.id === categoryId);
        if (!categoryExists) {
          errors.push(`Row ${rowNum}: Category ID "${categoryId}" not found`);
          continue;
        }
      }

      products.push({
        title,
        description,
        price,
        stock,
        category_id: categoryId,
        images: [], // Images excluded as per requirement
      });
    }

    // If there are validation errors, return them
    if (errors.length > 0 && products.length === 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }

    // Create products
    if (products.length > 0) {
      const result = await bulkCreateProducts(products);
      
      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error || 'Failed to create products',
            created: result.created || 0,
            failed: result.failed || products.length,
            validationErrors: errors.length > 0 ? errors : undefined
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        created: result.created || 0,
        failed: errors.length,
        validationErrors: errors.length > 0 ? errors : undefined,
        message: `Successfully created ${result.created} product(s)${errors.length > 0 ? `, ${errors.length} row(s) had errors` : ''}`
      });
    }

    return NextResponse.json(
      { error: 'No valid products to create', details: errors },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}

