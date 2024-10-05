document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservation-date').setAttribute('min', today);

    const filterButtons = document.querySelectorAll('.filter');
    const mainContent = document.querySelector('.main-content');
    const items = document.querySelectorAll('.item');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter.active').classList.remove('active');
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            if (filter == "all") {
                items.forEach(item => item.style.display = 'block');
            }
            else {
                items.forEach(item => {
                    if (item.classList.contains(filter)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    });
    mainContent.classList.add('show-all');
    updateBookingStatus();
});

function showUserOrders() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Your Email There Is No Orders');
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === loggedInUser.email);
    if (user && user.orders && user.orders.length > 0) {
        let orderDetails = "Your Orders:\n";
        user.orders.forEach(order => {
            orderDetails += `Item: ${order.item}, Price: ${order.price}\n`;
        });
        document.getElementById("orderDetails").innerText = orderDetails;
        openModal('orderDetailsModal');
    } else {
        alert('You have no orders yet');
    }
}
function openModal(modalId, itemName = '', itemCost = '') {
    if (modalId === 'paymentModal') {
        document.getElementById('orderName').value = itemName;
        document.getElementById('price').value = itemCost;
    }
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function toggleOnlinePaymentOptions(value) {
    var onlinePaymentOptions = document.getElementById("onlinePaymentOptions");
    if (value === "online") {
        onlinePaymentOptions.style.display = "block";
    } else {
        onlinePaymentOptions.style.display = "none";
    }
}

function submitPaymentForm(event) {
    event.preventDefault();
    const orderName = document.getElementById("orderName").value;
    const price = document.getElementById("price").value;
    const address = document.getElementById("address").value;
    const landmark = document.getElementById("landmark").value;
    const paymentMethod = document.getElementById("cash").value;
    const onlinePayment = document.getElementById("onlinePayment") ? document.getElementById("onlinePayment").value : '';

    const orderDetails = `Order Name: ${orderName}\nPrice: ${price}\nAddress: ${address}\nLandmark: ${landmark}\nPayment Method: ${paymentMethod}${paymentMethod === 'online' ? ` (${onlinePayment})` : ''}`;

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === loggedInUser.email);
        if (userIndex !== -1) {
            if (!users[userIndex].orders) {
                users[userIndex].orders = [];
            }
            users[userIndex].orders.push({ item: orderName, price: price });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    document.getElementById("orderDetails").innerText = orderDetails;
    closeModal('paymentModal');
    openModal('successModal');

    setTimeout(function () {
        closeModal('successModal');
        openModal('orderDetailsModal');
    }, 3000);
}


function showUserBookings() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Your Email There Is No Reservation');
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === loggedInUser.email);
    if (user && user.bookings && user.bookings.length > 0) {
        let bookingDetails = "Your Bookings:\n";
        user.bookings.forEach(booking => {
            bookingDetails += `Date: ${booking.date}, Time: ${booking.time}, Members: ${booking.members}, Name: ${booking.name}, Email: ${booking.email}, Number: ${booking.number}\n`;
        });
        alert(bookingDetails);
    }
    else {
        alert('You have no bookings yet');
    }
}
const totalChairs = 5;
function validateForm(event) {
    const date = document.getElementById('reservation-date').value;
    const time = document.getElementById('reservation-time').value;
    const members = parseInt(document.getElementById('members').value);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const number = document.getElementById('number').value;

    if (!date || !time || !members || !name || !email || !number) {
        alert('Please fill out all required fields.');
        event.preventDefault();
        return false;
    }
    if (!isLoggedInUser(email)) {
        alert('Only logged-in users can book a table.');
        event.preventDefault();
        return false;
    }
    if (!canBook(date, members)) {
        alert('Booking exceeds available seating. Please adjust the number of members or choose a different date.');
        event.preventDefault();
        return false;
    }
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        event.preventDefault();
        return false;
    }
    if (!validatePhoneNumber(number)) {
        alert('Please enter a valid 10-digit phone number.');
        event.preventDefault();
        return false;
    }
    // const timeValidation = validateTime(time);
    // if (!timeValidation.isValid) {
    //     alert(timeValidation.message);
    //     event.preventDefault();
    //     return false;
    // }
    saveBooking(date, time, members, name, email, number);
    showPopup();
    updateBookingStatus();
    return false;
}
// function validateTime(time) {
//     const [hours, minutes] = time.split(':').map(Number);
//     if (hours < 10 || (hours === 23 && minutes > 0) || hours > 23) {
//         return { isValid: false, message: 'Please select a time between 10:00 AM and 11:00 PM.' };
//     }
//     return { isValid: true };
// }
function isLoggedInUser(email) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    return loggedInUser && loggedInUser.email === email;
}

function canBook(date, members) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let totalMembers = 0;
    users.forEach(user => {
        if (user.bookings) {
            user.bookings.forEach(booking => {
                if (booking.date === date) {
                    totalMembers += parseInt(booking.members);
                }
            });
        }
    });
    return (totalMembers + members) <= totalChairs;
    // 7 dhagara meku per day enni table booking kavali annukute haa number evaldi
}
// edhi email validation means nv email wrong ga enter cheste edhi call ithadhi suppose mahi@123 este edhi wrong kadha haapudu edhi call itadi
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
// mobile no validation mobile no must be enter 10 digits only
function validatePhoneNumber(number) {
    const re = /^[0-9]{10}$/;
    return re.test(number);
}
function saveBooking(date, time, members, name, email, number) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === loggedInUser.email);
        if (userIndex !== -1) {
            if (!users[userIndex].bookings) {
                users[userIndex].bookings = [];
            }
            users[userIndex].bookings.push({
                date: date,
                time: time,
                members: members,
                name: name,
                email: email,
                number: number
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}
function showPopup() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Your Email There Is No Reservation');
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === loggedInUser.email);

    if (user && user.bookings && user.bookings.length > 0) {
        let bookingDetails = `
            <table>
                <thead>
                    <tr>
                        <th style="color: #ff511c;">Reservation Date</th>
                        <th style="color: #ff511c;">Reservation Time</th>
                        <th style="color: #ff511c;">Members</th>
                        <th style="color: #ff511c;">Name</th>
                        <th style="color: #ff511c;">Email</th>
                        <th style="color: #ff511c;">Phone Number</th>
                    </tr>
                </thead>
                <tbody>
        `;
        user.bookings.forEach(booking => {
            bookingDetails += `
                <tr>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td>${booking.members}</td>
                    <td>${booking.name}</td>
                    <td>${booking.email}</td>
                    <td>${booking.number}</td>
                </tr>
            `;
        });
        bookingDetails += `
                </tbody>
            </table>
        `;
        document.getElementById('orderDetails').innerHTML = bookingDetails;
        document.getElementById('orderDetailsModal').style.display = "block";
        document.getElementById('booking-details').innerHTML = bookingDetails;
        document.getElementById('popup').style.display = "block";
        document.getElementById('orderDetails').innerHTML = bookingDetails;
        document.getElementById('orderDetailsModal').style.display = "block";
        document.getElementById('reservationForm').reset();
    } else {
        alert('You have no bookings yet');
    }
}
function showUserBookings() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Your Email There Is No Reservation');
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === loggedInUser.email);
    if (user && user.bookings && user.bookings.length > 0) {
        let bookingDetails = "Your Bookings:\n";
        user.bookings.forEach(booking => {
            bookingDetails += `Date: ${booking.date}, Time: ${booking.time}, Members: ${booking.members}, Name: ${booking.name}, Email: ${booking.email}, Number: ${booking.number}\n`;
        });
        alert(bookingDetails);
    }
    else {
        alert('You have no bookings yet');
    }
}
function closePopup() {
    document.getElementById('popup').style.display = "none";
}
// New code...
// function updateBookingStatus() {
//     const date = document.getElementById('reservation-date').value;
//     const users = JSON.parse(localStorage.getItem('users')) || [];
//     let totalMembers = 0;
//     users.forEach(user => {
//         if (user.bookings) {
//             user.bookings.forEach(booking => {
//                 if (booking.date === date) {
//                     totalMembers += parseInt(booking.members);
//                 }
//             });
//         }
//     });
//     const remainingChairs = totalChairs - totalMembers;
//     const statusMessage = `Today, ${totalMembers} chairs are booked. ${remainingChairs} chairs are still available.`;
//     document.getElementById('bookingStatus').innerText = statusMessage;
// }
// document.getElementById('reservation-date').addEventListener('change', updateBookingStatus);
// document.getElementById('members').addEventListener('change', updateBookingStatus);
// document.addEventListener('DOMContentLoaded', updateBookingStatus);

function updateBookingStatus() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let totalMembersBooked = 0;
    users.forEach(user => {
        if (user.bookings) {
            user.bookings.forEach(booking => {
                totalMembersBooked += parseInt(booking.members);
            });
        }
    });
    const chairsAvailable = totalChairs - totalMembersBooked;
    const bookingStatusElement = document.getElementById('bookingStatus');
    bookingStatusElement.textContent = `Chairs Booked: ${totalMembersBooked}, Chairs Available: ${chairsAvailable}`;

    const reservationForm = document.getElementById('reservationForm');
    if (chairsAvailable > 0) {
        reservationForm.removeAttribute('disabled');
    } else {
        reservationForm.setAttribute('disabled', 'disabled');
    }
}






// FOOD ORDER DETAILS....
function showUserOrders() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Your Email There Is No Orders');
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === loggedInUser.email);
    if (user && user.orders && user.orders.length > 0) {
        let orderDetails = "Your Orders:\n";
        user.orders.forEach(order => {
            orderDetails += `Item: ${order.item}, Price: ${order.price}\n`;
        });
        document.getElementById("orderDetails").innerText = orderDetails;
        openModal('orderDetailsModal');
    } else {
        alert('You have no orders yet');
    }
}
function openModal(modalId, itemName = '', itemCost = '') {
    if (modalId === 'paymentModal') {
        document.getElementById('orderName').value = itemName;
        document.getElementById('price').value = itemCost;
    }
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function toggleOnlinePaymentOptions(value) {
    var onlinePaymentOptions = document.getElementById("onlinePaymentOptions");
    if (value === "online") {
        onlinePaymentOptions.style.display = "block";
    } else {
        onlinePaymentOptions.style.display = "none";
    }
}

function submitPaymentForm(event) {
    event.preventDefault();
    const orderName = document.getElementById("orderName").value;
    const price = document.getElementById("price").value;
    const address = document.getElementById("address").value;
    const landmark = document.getElementById("landmark").value;
    const paymentMethod = document.getElementById("cash").value;
    const onlinePayment = document.getElementById("onlinePayment") ? document.getElementById("onlinePayment").value : '';
    const orderDetails = `Order Name: ${orderName}\nPrice: ${price}\nAddress: ${address}\nLandmark: ${landmark}\nPayment Method: ${paymentMethod}${paymentMethod === 'online' ? ` (${onlinePayment})` : ''}`;
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === loggedInUser.email);
        if (userIndex !== -1) {
            if (!users[userIndex].orders) {
                users[userIndex].orders = [];
            }
            users[userIndex].orders.push({ item: orderName, price: price });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    document.getElementById("orderDetails").innerText = orderDetails;
    closeModal('paymentModal');
    openModal('successModal');
    setTimeout(function () {
        closeModal('successModal');
        openModal('orderDetailsModal');
    }, 3000);
}


// CONTACT SEND BUTTON CODE...
// validateData anndhi okk function e function ni nenu contact.html lo nuchi call chestuna 
// contact.html lo nv SendButton ni click chesenappudu e function call ithadhi 
// e function lo nenu const anne javascript keyword use chesanu 
// name,email,message anne okk variables thesukunaa...
//  haa variables ki nenu id tho pass chestuna contact.html nuchi  EX: id="contactName"  e id contact.html lo vutdhi..
// haa id ni nenu DOM (Document Object Model) use chese getElementById tho haa contact lo vunna particular id ni thesukuttunaa..
//  validateData(event)  event ante nv contact.html lo click chesank e evnet lo ki nv enter chesena values vastei..
// haa values ni okk variable ki assign chestuna...
// next step if statement use chestuna adduke annte naku data wrong ga vaste if statement call ithadi othewise sendMessage(name,email,message) ki call ithadhi...
//  alert("Message Send Successfully!") means pina alert message vastdhi...
// document.getElementById('request').reset() means nv alert lo okay click cheska nv contact.html lo fill chesena data reset ithadhi reset means clear ithadhi...
function validateData(event) {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    if (!name || !email || !message) {
        alert('Please fill out all required fields.');
        event.preventDefault();
        return false;
    }
    sendMessage(name, email, message);
    return false;
}
function sendMessage(name, email, message) {
    alert("Message Send Successfully!");
    document.getElementById('request').reset();
}