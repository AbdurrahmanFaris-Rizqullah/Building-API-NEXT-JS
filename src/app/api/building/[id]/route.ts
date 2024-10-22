import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET = async ( request : Request, { params }: { params : { id: string}} ) =>{
    const { id } = params;
    try {
      const building = await prisma.buildings.findUnique({
        where: { id: Number(id) },
      });
  
      if (!building) {
        return NextResponse.json({ msg: "Bangunan tidak ditemukan" }, { status: 404 });
      }
  
      return NextResponse.json({
        message: `Bangunan dengan id ${id}`,
        data: building,
      });
    } catch (error) {
      return NextResponse.json({ msg: (error as Error).message }, { status: 500 });
    }
  }