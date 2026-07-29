"use client";

import Link from "next/link";
import { ChevronLeft, Ticket, Users, MessageCircle, Video } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGetMyKelas } from "@/http/kelas/get-my-kelas";

export default function KelasayaPage() {
  const { data: session } = useSession();
  const token = session?.access_token || "";

  const { data, isLoading } = useGetMyKelas({ token });
  const myKelas = data?.data ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/kelas"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Kelas Saya
        </h1>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3"
            >
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="flex gap-3 mt-4">
                <div className="h-10 bg-gray-200 rounded-lg w-32" />
                <div className="h-10 bg-gray-200 rounded-lg w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && myKelas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Kamu belum terdaftar di kelas manapun
          </h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Daftar sekarang dan mulai perjalanan belajarmu bersama UrClass!
          </p>
          <Link
            href="/dashboard/kelas"
            className="px-5 py-2.5 bg-[#004AAB] hover:bg-[#003B8A] text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Lihat Program Kelas
          </Link>
        </div>
      )}

      {/* Enrolled kelas list */}
      {!isLoading && myKelas.length > 0 && (
        <div className="space-y-4">
          {myKelas.map((kelas) => (
            <div
              key={kelas.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
            >
              {/* Kelas Info */}
              <div>
                <h2 className="font-bold text-lg text-gray-900 mb-1">
                  {kelas.name}
                </h2>
                {kelas.description && (
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {kelas.description}
                  </p>
                )}
              </div>

              {/* Ticket bonus */}
              {kelas.ticket_amount > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>
                    Bonus <strong>{kelas.ticket_amount} tiket</strong> tryout premium
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {kelas.wa_group_link && (
                  <a
                    href={kelas.wa_group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Gabung Grup WA
                  </a>
                )}

                {kelas.wa_consultation_number && (
                  <a
                    href={`https://wa.me/${kelas.wa_consultation_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Konsultasi WA
                  </a>
                )}

                {kelas.meet_link && (
                  <a
                    href={kelas.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#004AAB] hover:bg-[#003B8A] text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Google Meet
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
