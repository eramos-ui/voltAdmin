
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

// import { NextRequest, NextResponse } from 'next/server';
// import { Prisma Client } from '@prisma/client';
// import { OptionsSelect } from '@/types/interfaces';

// const prisma = new Prisma Client();

// export default async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const { storedProcedure, parameter } = body;
//     console.log('en route.ts storedProcedure',storedProcedure);
//     if (!storedProcedure) {
//       return NextResponse.json(
//         { error: 'El nombre del stored procedure es obligatorio' },
//         { status: 400 }
//       );
//     }

//     // Construir el query para el stored procedure
//     const query = parameter
//       ? `EXEC ${storedProcedure} @param = ${parameter}`
//       : `EXEC ${storedProcedure}`;

//     // Ejecutar el stored procedure con Prisma
//     const result = await prisma.$queryRawUnsafe<OptionsSelect[]>(query);

//     // Mapear el resultado a la estructura { value, label }
//     const options = result.map((row: any) => ({
//       value: row.value,
//       label: row.label,
//     }));

//     return NextResponse.json(options, { status: 200 });
//   } catch (error) {
//     console.error('Error ejecutando el stored procedure:', error);
//     return NextResponse.json(
//       { error: 'Error al ejecutar el stored procedure' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }
