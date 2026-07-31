import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { 
      phoneNumber, 
      amount, 
      packageName, 
      senderName, 
      recipientName, 
      deliveryAddress, 
      cardMessage 
    } = await request.json();

    // 1. Format phone number (ensure format is 2547XXXXXXXX)
    let formattedPhone = phoneNumber.startsWith('0') 
      ? `254${phoneNumber.slice(1)}` 
      : phoneNumber.replace('+', '');

    // 2. Insert order details into Supabase database first
    const { error: dbError } = await supabase.from('orders').insert([
      {
        package_name: packageName,
        package_price: amount,
        recipient_name: recipientName,
        delivery_address: deliveryAddress,
        card_message: cardMessage,
        sender_name: senderName,
        phone_number: formattedPhone,
        payment_till: '4701520', // Updated to your direct Till
        business_name: 'Tech Talk Technologies',
        status: 'PENDING'
      }
    ]);

    if (dbError) {
      console.error('Database save error:', dbError);
    }

    // 3. Get Safaricom OAuth Access Token
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    const authBuffer = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${authBuffer}`
      }
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 4. Generate Timestamp and Password
    const date = new Date();
    const timestamp = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');

    const shortCode = process.env.DARAJA_SHORTCODE || '542542'; 
    const passkey = process.env.DARAJA_PASSKEY!;
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // 5. Send STK Push Request to Safaricom
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount.replace(/[^0-9]/g, ''), // Strip non-numeric like "KSh "
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stk-callback`,
        AccountReference: '476765', 
        TransactionDesc: `Payment for ${packageName} by ${senderName}`
      })
    });

    const stkData = await stkResponse.json();
    return NextResponse.json({ success: true, data: stkData });

  } catch (error: any) {
    console.error('STK Push Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const { phoneNumber, amount, packageName, senderName } = await request.json();

//     // 1. Format phone number (ensure format is 2547XXXXXXXX)
//     let formattedPhone = phoneNumber.startsWith('0') 
//       ? `254${phoneNumber.slice(1)}` 
//       : phoneNumber.replace('+', '');

//     // 2. Get Safaricom OAuth Access Token
//     const consumerKey = process.env.DARAJA_CONSUMER_KEY;
//     const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
//     const authBuffer = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

//     const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
//       headers: {
//         Authorization: `Basic ${authBuffer}`
//       }
//     });
//     const tokenData = await tokenResponse.json();
//     const accessToken = tokenData.access_token;

//     // 3. Generate Timestamp and Password
//     const date = new Date();
//     const timestamp = date.getFullYear().toString() +
//       String(date.getMonth() + 1).padStart(2, '0') +
//       String(date.getDate()).padStart(2, '0') +
//       String(date.getHours()).padStart(2, '0') +
//       String(date.getMinutes()).padStart(2, '0') +
//       String(date.getSeconds()).padStart(2, '0');

//     const shortCode = process.env.DARAJA_SHORTCODE || '542542'; // I&M Paybill Shortcode
//     const passkey = process.env.DARAJA_PASSKEY!;
//     const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

//     // 4. Send STK Push Request to Safaricom
//     const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         BusinessShortCode: shortCode,
//         Password: password,
//         Timestamp: timestamp,
//         TransactionType: 'CustomerPayBillOnline',
//         Amount: amount.replace(/[^0-9]/g, ''), // Strip non-numeric like "KSh "
//         PartyA: formattedPhone,
//         PartyB: shortCode,
//         PhoneNumber: formattedPhone,
//         CallBackURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stk-callback`,
//         AccountReference: '476765', // I&M Account / Till Number
//         TransactionDesc: `Payment for ${packageName} by ${senderName}`
//       })
//     });

//     const stkData = await stkResponse.json();
//     return NextResponse.json({ success: true, data: stkData });

//   } catch (error: any) {
//     console.error('STK Push Error:', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
// // import { NextResponse } from 'next/server';

// // export async function POST(request: Request) {
// //   try {
// //     const { phoneNumber, amount, packageName, senderName } = await request.json();

// //     // 1. Format phone number (ensure format is 2547XXXXXXXX)
// //     let formattedPhone = phoneNumber.startsWith('0') 
// //       ? `254${phoneNumber.slice(1)}` 
// //       : phoneNumber.replace('+', '');

// //     // 2. Get Safaricom OAuth Access Token
// //     const consumerKey = process.env.DARAJA_CONSUMER_KEY;
// //     const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
// //     const authBuffer = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

// //     const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
// //       headers: {
// //         Authorization: `Basic ${authBuffer}`
// //       }
// //     });
// //     const tokenData = await tokenResponse.json();
// //     const accessToken = tokenData.access_token;

// //     // 3. Generate Timestamp and Password
// //     const date = new Date();
// //     const timestamp = date.getFullYear().toString() +
// //       String(date.getMonth() + 1).padStart(2, '0') +
// //       String(date.getDate()).padStart(2, '0') +
// //       String(date.getHours()).padStart(2, '0') +
// //       String(date.getMinutes()).padStart(2, '0') +
// //       String(date.getSeconds()).padStart(2, '0');

// //     const shortCode = process.env.DARAJA_SHORTCODE || '174379'; // Use your Till/Paybill shortcode
// //     const passkey = process.env.DARAJA_PASSKEY!;
// //     const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

// //     // 4. Send STK Push Request to Safaricom
// //     const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
// //       method: 'POST',
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //         'Content-Type': 'application/json'
// //       },
// //       body: JSON.stringify({
// //         BusinessShortCode: shortCode,
// //         Password: password,
// //         Timestamp: timestamp,
// //         TransactionType: 'CustomerPayBillOnline',
// //         Amount: amount.replace(/[^0-9]/g, ''), // Strip non-numeric like "KSh "
// //         PartyA: formattedPhone,
// //         PartyB: shortCode,
// //         PhoneNumber: formattedPhone,
// //         CallBackURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/stk-callback`,
// //         AccountReference: 'TechTalk Technologies',
// //         TransactionDesc: `Payment for ${packageName} by ${senderName}`
// //       })
// //     });

// //     const stkData = await stkResponse.json();
// //     return NextResponse.json({ success: true, data: stkData });

// //   } catch (error: any) {
// //     console.error('STK Push Error:', error);
// //     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// //   }
// // }