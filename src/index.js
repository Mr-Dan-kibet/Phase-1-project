const API1URL = "http://localhost:3000/bookings";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("Booking-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent page reload

    const name = document.getElementById("name").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const residence = document.getElementById("residence").value;
    const departureDate = document.getElementById("date").value;
    const route = document.getElementById("route-selector").value;
    const departureTime = document.getElementById("time-selctor").value;
    const selectedSeats = document.querySelectorAll(".seat.selected");
    const seats = selectedSeats.length;

    // 3. Construct booking object
    const booking = {
      name,
      phoneNumber,
      residence,
      departureDate,
      route,
      departureTime,
      selectedSeats,
      seats,
      paymentStatus: "Pending",
      mpesaCode: "",
    };

    // 4. Send booking to db.json via POST
    fetch(API1URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Booking added:", data);
        alert("✅ Booking successfully submitted!");
        form.reset(); // clear the form
        //  remove .selected class from all seat buttons
        document
          .querySelectorAll(".seat.selected")
          .forEach((btn) => btn.classList.remove("selected"));
      })
      .catch((error) => {
        console.error("Booking failed:", error);
        alert("❌ Something went wrong.");
      });
  });
});
