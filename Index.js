export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Example: /search?date=2024-11-20&dentist_id=1
    if (path.startsWith("/search")) {
      const { date, dentist_id } = Object.fromEntries(new URLSearchParams(url.search));

      // Query the database for available slots (including new columns patient_name and confirmed)
      const slots = await env.DATABASE.prepare(`
        SELECT id, date, time, professional_id, patient_name, confirmed 
        FROM Appointments 
        WHERE date = ? AND professional_id = ? AND is_booked = 0`)
        .bind(date, dentist_id)
        .all();

      if (slots.results.length > 0) {
        return new Response(JSON.stringify({ available_slots: slots.results }), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ message: "No available slots found." }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Invalid Request", { status: 400 });
  }
};
