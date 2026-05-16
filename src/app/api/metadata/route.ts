import { NextResponse } from 'next/server';

export async function GET() {
  const metadata = {
    segments: [
      'Mining',
      'Municipal Drinking',
      'Municipal Wastewater',
      'Oil & Gas',
      'Pharmaceutical',
      'Power',
      'Residential',
      'Others',
    ],
    countries: [
      'United States',
      'India',
      'Saudi Arabia',
      'United Arab Emirates',
      'Qatar',
      'Singapore',
      'Australia',
      'United Kingdom',
      'Germany',
      'Canada',
      'Brazil',
    ],
    currencies: [
      'US Dollar (USD)',
      'Chinese Yuan (RMB)',
      'Indian Rupee (INR)',
      'Euro (EUR)',
      'British Pound (GBP)',
    ],
  };

  return NextResponse.json(metadata);
}
