export default function LiveClassSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900">
        Jadwal Live Class Gratis 🎓
      </h2>
      <div className="w-full min-h-[200px] rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-3 p-8">
        <div className="text-4xl">📅</div>
        <p className="text-gray-400 text-sm text-center">
          Belum ada jadwal live class saat ini.
          <br />
          Nantikan informasi selanjutnya ya!
        </p>
      </div>
    </section>
  );
}
