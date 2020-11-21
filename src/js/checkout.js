import axios from 'axios';
import Noty from 'noty';

// Setting-up a client to make a payment...
const stripe = Stripe("pk_test_51HQBzsCcQwpTTZ9VkTIlh1dWNzxoxz0fkaV1od3A49eKkHT17PFBSjDHtBOnqDwz67YfSYCFjOhUlio5wqES8Ibo00NENuqhlW");

document.querySelector('button').disabled = true;

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
const payWithCard = function (stripe, card, clientSecret) {
  loading(true);
  stripe.confirmCardPayment(clientSecret, {
    receipt_email: document.getElementById('email').value,
    payment_method: {
      card: card
    },
    shipping: {
      address: {
        line1: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        country: document.getElementById('country').value
      },
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value
    }
  }).then(function (result) {
    if (result.error) {
      // Show error to your customer
      showError(result.error.message);
    } else {
      // The payment succeeded!
      // const result = paymentIntent : {
      //   amount: 110000,
      //   canceled_at: null,
      //   cancellation_reason: null,
      //   capture_method: "automatic",
      //   client_secret: "pi_1Hf0F7CcQwpTTZ9V0UGzdYl7_secret_xdZvSoeZ73r5WvI4g7ts6w6yL",
      //   confirmation_method: "automatic",
      //   created: 1603359477,
      //   currency: "inr",
      //   description: null,
      //   id: "pi_1Hf0F7CcQwpTTZ9V0UGzdYl7",
      //   last_payment_error: null,
      //   livemode: false,
      //   next_action: null,
      //   object: "payment_intent",
      //   payment_method: "pm_1Hf0FhCcQwpTTZ9V2obPhhbe",
      //   payment_method_types: ["card"],
      //   receipt_email: "john@xyz.com",
      //   setup_future_usage: null,
      //   shipping: {
      //     address: {
      //       city: "San Francisco",
      //       country: "USA",
      //       line1: "Park Avenue",
      //       line2: null,
      //       postal_code: null,
      //       state: "CA"
      //     },
      //     carrier: null,
      //     name: "John Fish",
      //     phone: "016-123-5816",
      //     tracking_number: null
      //   },
      //   source: null,
      //   status: "succeeded"
      // }
      orderComplete(result.paymentIntent.shipping, result.paymentIntent.amount);
    }
  });
};
/* ------- UI helpers ------- */
// Shows a success message when the payment is complete
const orderComplete = function (shippingDetails, amount) {
  loading(false);
  document.querySelector("button").disabled = true;
  new Noty({
    type: 'success',
    text: `Thankyou, We recieved ${amount} from you`,
    timeout: 800,
    progressBar: false,
  }).show();
  setTimeout(() => {
    document.querySelector('#order-contact').value = shippingDetails.phone;
    document.querySelector('#order-address').value = `${shippingDetails.address.line1}, ${shippingDetails.address.city}, ${shippingDetails.address.state}, ${shippingDetails.address.country}`;
    document.querySelector('#redirect-orders').submit();
  }, 1200);
};
// Show the customer the error from Stripe if their card fails to charge
const showError = function (errorMsgText) {
  loading(false);
  const errorMsg = document.querySelector("#card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};
// Show a spinner on payment submission
const loading = function (isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};

axios.post('/create-payment-intent').then(res => {
  const elements = stripe.elements();
  const style = {
    base: {
      color: "#32325d",
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#32325d"
      }
    },
    invalid: {
      fontFamily: 'Arial, sans-serif',
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };
  const card = elements.create("card", { style: style });
  // Stripe injects an iframe into the DOM
  card.mount("#card-element");
  card.on("change", function (event) {
    // Disable the Pay button if there are no card details in the Element
    document.querySelector("button").disabled = event.empty;
    document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
  });
  const form = document.getElementById("payment-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Complete payment when the submit button is clicked
    payWithCard(stripe, card, res.data.clientSecret);
  });
});


