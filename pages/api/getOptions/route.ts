
import { NextRequest, NextResponse } from 'next/server';
import { executeSP } from '@/lib/server/spExecutor';
import sql from 'mssql';
import { OptionsSelect } from '@/types/interfaces';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storedProcedure, parameter } = body;

    console.log('en route.ts storedProcedure', storedProcedure);

    if (!storedProcedure) {
      return NextResponse.json(
        { error: 'El nombre del stored procedure es obligatorio' },
        { status: 400 }
      );
    }

    const parameters = parameter
      ? [
          {
            name: 'param',
            type: sql.NVarChar(sql.MAX),
            value: parameter,
          },
        ]
      : [];

    const result = await executeSP<OptionsSelect>(storedProcedure, parameters);

    const options = result.map((row: any) => ({
      value: row.value,
      label: row.label,
    }));

    return NextResponse.json(options, { status: 200 });
  } catch (error) {
    console.error('Error ejecutando el stored procedure:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar el stored procedure' },
      { status: 500 }
    );
  }
}

