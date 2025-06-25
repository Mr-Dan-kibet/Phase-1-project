const API1URL = "http://localhost:3000/bookings";

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
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const residence = document.getElementById("residence").value;
    const departureDate = document.getElementById("date").value;
    const route = document.getElementById("route-selector").value;
    const departureTime = document.getElementById("time-selctor").value;

    // 2.2 Build booking object
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

    // Send data to db.json using POST
    fetch(API1URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    })
      .then((res) => res.json()) // convert response to usable object
      .then((data) => {
        alert("✅ Booking successfully submitted!");
        form.reset();

        // Clear seat selection state
        selectedSeats = [];
        seatButtons.forEach((btn) => btn.classList.remove("selected"));

        // Reset total price display
        totalDisplay.innerHTML = `Total: KES 0 <br/>
          <button type="submit">Checkout</button>`;
      })
      .catch((error) => {
        console.error("Booking failed:", error);
        alert("❌ Something went wrong while submitting.");
      });
  });
});

