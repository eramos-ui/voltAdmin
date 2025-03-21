import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export default async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { storedProcedure, parameter } = body;
    console.log('en getJson storedProcedure',storedProcedure);
    if (!storedProcedure) {
      return NextResponse.json(
        { error: 'El nombre del stored procedure es obligatorio' },
        { status: 400 }
      );
    }

    // Construir el query para el stored procedure
    const query = parameter
      ? `EXEC ${storedProcedure} @param = ${parameter}`
      : `EXEC ${storedProcedure}`;

    // Ejecutar el stored procedure con Prisma
    const result = await prisma.$queryRawUnsafe<any>(query);



    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error ejecutando el stored procedure:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar el stored procedure' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
