import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary"; // Pastikan Anda mengimpor ini dengan benar
import { Readable, PassThrough } from 'stream';

// Konfigurasi Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Ganti dengan nama cloud Anda
  api_key: process.env.CLOUDINARY_API_KEY, // Ganti dengan API key Anda
  api_secret: process.env.CLOUDINARY_API_SECRET, // Ganti dengan API secret Anda
});

const prisma = new PrismaClient();

export const GET = async () => {

  // mengganti nama fungsi
  try {
    const buildings = await prisma.buildings.findMany();
    return NextResponse.json({
      message: "Daftar bangunan",
      data: buildings,
    });
  } catch (error) {
    return NextResponse.json({ msg: (error as Error).message }, { status: 404 });
  }
}

    // Membuat bangunan baru
export async function POST(request: Request) {
  const { desc } = await request.json(); // Ambil deskripsi dari body
  const files = await request.formData(); // Ambil data form

  try {
const fileArray = files.getAll('foto');

    const photoUrls = await Promise.all(
      Array.from(fileArray).map(async (file) => {
        
        if (file instanceof File) {
          return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
              {
                folder: 'my-building',
              },
              (error, result) => {
                if (result) {
                  resolve(result.secure_url); // Dapatkan URL gambar
                } else {
                  reject(new Error(`Upload failed: ${error?.message}`)); // Tangani error jika upload gagal
                }
              }
            );

            const passThrough = new PassThrough();
            const readableStream = fileValue.stream(); // Ini adalah ReadableStream
            
            // Pipe dari ReadableStream ke PassThrough
            readableStream.pipe(passThrough);
            passThrough.pipe(uploadStream); // Pipe ke uploadStream Cloudinary
          });
        }
        return null; // Jika bukan file, kembalikan null
      })
    );

    // Filter photoUrls untuk menghindari null values
    const validPhotoUrls = photoUrls.filter(url => url !== null);

    // Simpan data bangunan ke database
    const result = await prisma.buildings.create({
      data: {
        desc,
        foto1: validPhotoUrls[0] || "", // Simpan URL gambar ke database
        foto2: validPhotoUrls[1] || "",
        foto3: validPhotoUrls[2] || "",
        foto4: validPhotoUrls[3] || "",
        foto5: validPhotoUrls[4] || "",
      },
    });
    

    return NextResponse.json(
      {
        message: `Bangunan berhasil dibuat dengan deskripsi: ${desc}`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error); // Log error di server
    return NextResponse.json(
      {
        msg: (error as Error).message || "Terjadi kesalahan tidak terduga", // Tampilkan pesan kesalahan
      },
      { status: 500 }
    );
  }
}


// Memperbarui bangunan
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { desc } = await request.json();
  const files = await request.formData();

  try {
    const photoUrls = await Promise.all(
      Array.from(files).map(async (file) => {
        const uploadResult = await cloudinary.v2.uploader.upload(file[1].st ream(), {
          folder: "your-folder-name", // Ganti dengan nama folder yang sesuai
        });
        return uploadResult.secure_url;
      })
    );

    const updatedBuilding = await prisma.buildings.update({
      where: { id: Number(id) },
      data: {
        desc,
        foto1: photoUrls[0] || "",
        foto2: photoUrls[1] || "",
        foto3: photoUrls[2] || "",
        foto4: photoUrls[3] || "",
        foto5: photoUrls[4] || "",
      },
    });

    return NextResponse.json({
      message: `Bangunan berhasil diperbarui dengan id ${id}`,
      data: updatedBuilding,
    });
  } catch (error) {
    return NextResponse.json({ msg: (error as Error).message }, { status: 400 });
  }
}

// Menghapus bangunan
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const building = await prisma.buildings.findUnique({
      where: { id: Number(id) },
    });

    if (!building) {
      return NextResponse.json({ msg: "Bangunan tidak ditemukan" }, { status: 404 });
    }

    // Hapus foto dari Cloudinary (opsional)
    await Promise.all(
      [building.foto1, building.foto2, building.foto3, building.foto4, building.foto5].map(async (url) => {
        if (url) {
          const publicId = url?.split("/").pop()?.split(".")[0]; // Ambil public ID
          await cloudinary.v2.uploader.destroy(publicId);
        }
      })
    );

    const deletedBuilding = await prisma.buildings.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      message: `Bangunan berhasil dihapus dengan id ${id}`,
      data: deletedBuilding,
    });
  } catch (error) {
    return NextResponse.json({ msg: (error as Error).message }, { status: 400 });
  }
}
