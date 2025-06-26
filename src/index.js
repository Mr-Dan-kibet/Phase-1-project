const API1URL = "http://localhost:3000/bookings";
const MPESA_API_URL = "http://localhost:5000/mpesa/stk";

document.addEventListener("DOMContentLoaded", () => {
  //  1. Seat Selection Logic
  const seatButtons = document.querySelectorAll(".seat");
  const totalDisplay = document.getElementById("bookingTotal");
  let selectedSeats = [];

  // Loop through each seat button
  seatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const seatNumber = button.textContent;

      if (selectedSeats.includes(seatNumber)) {
        selectedSeats = selectedSeats.filter((seat) => seat !== seatNumber);
        button.classList.remove("selected"); // removes seats from array
      } else {
        // If not selected, add it to the list
        selectedSeats.push(seatNumber);
        button.classList.add("selected");
      }

      // Update the total price display (KES 1000 per seat)
      totalDisplay.innerHTML = `Total: KES ${selectedSeats.length * 1000} <br/>
        <button type="submit">Checkout</button>`;
    });
  });

  // 2. Booking Form Submission Logic
  const form = document.getElementById("Booking-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const residence = document.getElementById("residence").value;
    const departureDate = document.getElementById("date").value;
    const route = document.getElementById("route-selector").value;
    const departureTime = document.getElementById("time-selctor").value;

    //  Build booking object
    const booking = {
      name,
      phoneNumber,
      residence,
      departureDate,
      route,
      departureTime,
      selectedSeats,
      seats: selectedSeats.length,
      paymentStatus: "Pending",
      mpesaCode: "",
    };

    try {
      // Send data to db.json using POST
      const res = await fetch(API1URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      });

      const data = await res.json();
      alert("✅ Booking successfully submitted!");
      form.reset();

      // Clear seat selection state
      selectedSeats = [];
      seatButtons.forEach((btn) => btn.classList.remove("selected"));

      // Reset total price display
      totalDisplay.innerHTML = `Total: KES 0 <br/>
          <button type="submit">Checkout</button>`;

      // Prompt for M-Pesa number
      let mpesaPhone = prompt("Enter M-Pesa number to pay (e.g. 0712345678):");

      if (!mpesaPhone || mpesaPhone.trim() === "") {
        alert("❌ M-Pesa number required. Booking saved but payment not sent.");
        return;
      }

      mpesaPhone = mpesaPhone.startsWith("0")
        ? "254" + mpesaPhone.slice(1)
        : mpesaPhone;

      const amount = booking.seats * 1000;

      // Send STK Push to server
      const stkRes = await fetch(MPESA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: mpesaPhone, amount }),
      });

      const stkData = await stkRes.json();

      if (stkData.success) {
        alert(
          "📲 M-Pesa prompt sent successfully. Complete payment on your phone."
        );
      } else {
        alert("❌ STK Push failed. Try again later.");
        console.error(stkData);
      }
    } catch (error) {
      console.error("❌ Booking or STK Push failed:", error);
      alert("❌ Something went wrong while submitting.");
    }
  });
});
