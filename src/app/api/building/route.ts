import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary"; // Pastikan Anda mengimpor ini dengan benar
import { PassThrough } from "stream";
import { errorHandler } from "@/app/api/middleware/errorhandler";

const prisma = new PrismaClient();

// Konfigurasi Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Ganti dengan nama cloud Anda
  api_key: process.env.CLOUDINARY_API_KEY, // Ganti dengan API key Anda
  api_secret: process.env.CLOUDINARY_API_SECRET, // Ganti dengan API secret Anda
});


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
};



export async function POST(request: Request) {
  try {
    console.log("Menerima request...");
    
    const formData = await request.formData(); // Ambil formData (untuk file dan deskripsi)
    // console.log("Form data diterima:", formData);
    
    const desc = formData.get("desc")?.toString(); // Ambil deskripsi dari formData
    console.log("Deskripsi diterima:", desc);

    if (!desc || !formData) {
      throw { name: "invalid input", message: "Deskripsi atau data form tidak ditemukan" };
    }

    const fileArray = formData.getAll("foto"); // Ambil semua file 'foto'
    console.log("File array:", fileArray);

    if (fileArray.length === 0) {
      throw { name: "FileRequired", message: "Minimal satu file harus diupload" };
    }

    // Deklarasi photoUrls sebagai array string atau null
    let photoUrls: (string | null)[] = [];

    try {
      photoUrls = await Promise.all(
        Array.from(fileArray).map(async (file) => {
          if (file instanceof File) {
            console.log("Memproses file:", file.name);

            return new Promise<string>(async (resolve, reject) => {
              try {
                const arrayBuffer = await file.arrayBuffer();
                console.log(`ArrayBuffer file ${file.name} diterima`, arrayBuffer);

                const buffer = Buffer.from(arrayBuffer);
                console.log("Buffer:", buffer);

                // Upload ke Cloudinary
                cloudinary.v2.uploader.upload_stream(
                  { folder: "my-building" },
                  (error, result) => {
                    if (error) {
                      console.error("Upload error:", error);
                      return reject(new Error(`Upload failed: ${error.message}`));
                    }
                    if (result) {
                      console.log(`Upload berhasil untuk file ${file.name}:`, result.secure_url);
                      resolve(result.secure_url);
                    }
                  }
                ).end(buffer);
              } catch (uploadError) {
                console.error("Error dalam proses upload:", uploadError);
                reject(uploadError);
              }
            });
          }
          return null; // Jika bukan file, kembalikan null
        })
      );

      console.log("Proses upload selesai:", photoUrls);
    } catch (error) {
      console.error("Error selama proses upload:", error);
      throw { name: "Upload failed", message: "Gagal mengupload file ke Cloudinary" };
    }

    const validPhotoUrls = photoUrls.filter((url: string | null): url is string => url !== null);
    console.log("Valid photo URLs:", validPhotoUrls);

    const result = await prisma.buildings.create({
      data: {
        desc,
        foto1: validPhotoUrls[0] || "",
        foto2: validPhotoUrls[1] || "",
        foto3: validPhotoUrls[2] || "",
        foto4: validPhotoUrls[3] || "",
        foto5: validPhotoUrls[4] || "",
        published: true, // Set default to true
      },
    });

    console.log("Database insertion berhasil:", result);

    return NextResponse.json(
      {
        message: `Bangunan berhasil dibuat dengan deskripsi: ${desc}`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error terdeteksi:", error);
    const { status, message } = errorHandler(error);
    return NextResponse.json({ msg: message }, { status });
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
        const uploadResult = await cloudinary.v2.uploader.upload(file[1].stream(), {
          folder: "my-building", // Ganti dengan nama folder yang sesuai
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

