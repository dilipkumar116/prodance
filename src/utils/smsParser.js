export function parseSMSBatch(text) {
  try {
    if (!text || typeof text !== 'string') return [];
    
    // Split by double newlines or similar large gaps
    const rawMessages = text.split(/\n\s*\n/);
    const results = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 10);
    
    for (const msg of rawMessages) {
      const trimmed = msg.trim();
      if (!trimmed) continue;
      
      // Quick pre-filter
      if (/OTP|Do not share|is your OTP/i.test(trimmed)) continue;
      if (/(credited|received)/i.test(trimmed) && !/(debited|Spent|deducted|payment of)/i.test(trimmed)) continue;
      if (!/(debited|Spent|deducted|payment of)/i.test(trimmed)) continue;

      let amount = null;
      let date = null;
      let dateIsApproximate = false;

      // Extract Amount
      // Format A (Axis Bank card): Spent INR 51
      let amountMatch = trimmed.match(/Spent INR ([\d,]+(?:\.\d+)?)/i);
      if (!amountMatch) {
        // Format B (SBI UPI): debited by 260.00
        amountMatch = trimmed.match(/debited by ([\d,]+(?:\.\d+)?)/i);
      }
      if (!amountMatch) {
         amountMatch = trimmed.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i);
      }

      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
      
      if (!amount || amount <= 0) continue;

      // Extract Date
      // Format A date: 07-10-26 18:35:21 IST
      let dateMatch = trimmed.match(/(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s+IST/i);
      if (dateMatch) {
         // DD-MM-YY HH:MM:SS
         const dd = parseInt(dateMatch[1], 10);
         const mm = parseInt(dateMatch[2], 10) - 1;
         const yy = 2000 + parseInt(dateMatch[3], 10);
         const hr = parseInt(dateMatch[4], 10);
         const min = parseInt(dateMatch[5], 10);
         const sec = parseInt(dateMatch[6], 10);
         date = new Date(yy, mm, dd, hr, min, sec);
      } else {
         // Format B date: on date 06Oct26
         dateMatch = trimmed.match(/on date (\d{2})([A-Za-z]{3})(\d{2})/i);
         if (dateMatch) {
            const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
            const dd = parseInt(dateMatch[1], 10);
            const mm = months[dateMatch[2].toLowerCase()];
            const yy = 2000 + parseInt(dateMatch[3], 10);
            date = new Date(yy, mm !== undefined ? mm : new Date().getMonth(), dd);
         } else {
            // ISO-like: 2026-10-07
            dateMatch = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
               date = new Date(dateMatch[1]);
            } else {
               date = new Date();
               dateIsApproximate = true;
            }
         }
      }

      if (isNaN(date.getTime())) {
         date = new Date();
         dateIsApproximate = true;
      }

      // Apply 10-day filter
      if (date < cutoff) continue;

      const id = `${amount}_${date.toISOString().replace(/[^0-9T]/g, '')}`;

      results.push({
        id,
        amount,
        date: date.toISOString(),
        dateIsApproximate,
        status: 'pending'
      });
    }

    return results;
  } catch (e) {
    console.error('[SMSParser] Parsing failed:', e);
    return [];
  }
}
