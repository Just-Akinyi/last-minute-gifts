import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Safaricom sends the callback data wrapped inside Body.stkCallback
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ success: false, error: "Invalid callback payload" }, { status: 400 });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // ResultCode === 0 means the transaction was successful (User entered PIN correctly)
    if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
      let mpesaReceiptNumber = '';
      let phoneNumber = '';

      // Extract details from metadata items
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceiptNumber = item.Value;
        }
        if (item.Name === 'PhoneNumber') {
          phoneNumber = String(item.Value);
        }
      }

      // Update the order in Supabase to COMPLETED and save the M-Pesa Receipt
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'COMPLETED', 
          mpesa_receipt: mpesaReceiptNumber,
          updated_at: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)
        .eq('status', 'PENDING'); // Updates the latest pending order for this phone

      if (updateError) {
        console.error('Failed to update order in database:', updateError);
      }

      console.log(`Payment successful! Receipt: ${mpesaReceiptNumber}`);
    } else {
      // Transaction failed, was cancelled by user, or timed out
      console.log(`Payment failed or cancelled: ${ResultDesc}`);

      // Optional: Update status to FAILED or CANCELLED in Supabase if needed
      // Find the user by CheckoutRequestID if you store it, or leave as PENDING
    }

    // Always respond back to Safaricom acknowledging receipt of the callback
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error: any) {
    console.error('STK Callback Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}