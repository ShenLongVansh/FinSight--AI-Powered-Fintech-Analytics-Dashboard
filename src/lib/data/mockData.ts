import { Transaction } from '@/types';

// Realistic mock transaction data for demo purposes
export const mockTransactions: Transaction[] = [
    // January 2024
    { id: '1', date: '2024-01-05', description: 'Salary Credit - TechCorp Inc', amount: 85000, type: 'credit', category: 'Income' },
    { id: '2', date: '2024-01-07', description: 'Swiggy Food Order', amount: 456, type: 'debit', category: 'Food & Dining' },
    { id: '3', date: '2024-01-10', description: 'Amazon.in Shopping', amount: 2340, type: 'debit', category: 'Shopping' },
    { id: '4', date: '2024-01-12', description: 'Netflix Subscription', amount: 649, type: 'debit', category: 'Subscriptions' },
    { id: '5', date: '2024-01-15', description: 'Electricity Bill - BSES', amount: 2100, type: 'debit', category: 'Bills & Utilities' },
    { id: '6', date: '2024-01-18', description: 'Uber Ride', amount: 234, type: 'debit', category: 'Travel' },
    { id: '7', date: '2024-01-20', description: 'Zomato Order', amount: 890, type: 'debit', category: 'Food & Dining' },
    { id: '8', date: '2024-01-22', description: 'Spotify Premium', amount: 119, type: 'debit', category: 'Subscriptions' },
    { id: '9', date: '2024-01-25', description: 'Flipkart Purchase', amount: 5670, type: 'debit', category: 'Shopping' },
    { id: '10', date: '2024-01-28', description: 'Mobile Recharge - Jio', amount: 599, type: 'debit', category: 'Bills & Utilities' },

    // February 2024
    { id: '11', date: '2024-02-05', description: 'Salary Credit - TechCorp Inc', amount: 85000, type: 'credit', category: 'Income' },
    { id: '12', date: '2024-02-08', description: 'BigBasket Groceries', amount: 3450, type: 'debit', category: 'Food & Dining' },
    { id: '13', date: '2024-02-10', description: 'Myntra Fashion', amount: 4560, type: 'debit', category: 'Shopping' },
    { id: '14', date: '2024-02-12', description: 'Netflix Subscription', amount: 649, type: 'debit', category: 'Subscriptions' },
    { id: '15', date: '2024-02-14', description: 'Valentine Dinner - Olive Bistro', amount: 4200, type: 'debit', category: 'Food & Dining' },
    { id: '16', date: '2024-02-16', description: 'Petrol - HP', amount: 3000, type: 'debit', category: 'Travel' },
    { id: '17', date: '2024-02-18', description: 'Internet Bill - Airtel', amount: 1199, type: 'debit', category: 'Bills & Utilities' },
    { id: '18', date: '2024-02-20', description: 'Freelance Payment', amount: 25000, type: 'credit', category: 'Income' },
    { id: '19', date: '2024-02-22', description: 'Spotify Premium', amount: 119, type: 'debit', category: 'Subscriptions' },
    { id: '20', date: '2024-02-25', description: 'Gym Membership - Cult.fit', amount: 2500, type: 'debit', category: 'Health' },

    // March 2024
    { id: '21', date: '2024-03-05', description: 'Salary Credit - TechCorp Inc', amount: 85000, type: 'credit', category: 'Income' },
    { id: '22', date: '2024-03-07', description: 'Swiggy Food Order', amount: 780, type: 'debit', category: 'Food & Dining' },
    { id: '23', date: '2024-03-09', description: 'Amazon Prime Subscription', amount: 1499, type: 'debit', category: 'Subscriptions' },
    { id: '24', date: '2024-03-12', description: 'Netflix Subscription', amount: 649, type: 'debit', category: 'Subscriptions' },
    { id: '25', date: '2024-03-15', description: 'Flight Booking - Goa Trip', amount: 12500, type: 'debit', category: 'Travel' },
    { id: '26', date: '2024-03-18', description: 'Hotel Booking - Goa', amount: 8500, type: 'debit', category: 'Travel' },
    { id: '27', date: '2024-03-20', description: 'Electricity Bill - BSES', amount: 1890, type: 'debit', category: 'Bills & Utilities' },
    { id: '28', date: '2024-03-22', description: 'Spotify Premium', amount: 119, type: 'debit', category: 'Subscriptions' },
    { id: '29', date: '2024-03-25', description: 'Nykaa Beauty', amount: 2340, type: 'debit', category: 'Shopping' },
    { id: '30', date: '2024-03-28', description: 'Dividend Credit - Stocks', amount: 5600, type: 'credit', category: 'Income' },

    // April 2024
    { id: '31', date: '2024-04-05', description: 'Salary Credit - TechCorp Inc', amount: 90000, type: 'credit', category: 'Income' },
    { id: '32', date: '2024-04-08', description: 'Dominos Pizza', amount: 890, type: 'debit', category: 'Food & Dining' },
    { id: '33', date: '2024-04-10', description: 'Decathlon Sports', amount: 5670, type: 'debit', category: 'Shopping' },
    { id: '34', date: '2024-04-12', description: 'Netflix Subscription', amount: 649, type: 'debit', category: 'Subscriptions' },
    { id: '35', date: '2024-04-15', description: 'Water Bill', amount: 450, type: 'debit', category: 'Bills & Utilities' },
    { id: '36', date: '2024-04-18', description: 'Ola Ride', amount: 345, type: 'debit', category: 'Travel' },
    { id: '37', date: '2024-04-20', description: 'Starbucks Coffee', amount: 560, type: 'debit', category: 'Food & Dining' },
    { id: '38', date: '2024-04-22', description: 'Spotify Premium', amount: 119, type: 'debit', category: 'Subscriptions' },
    { id: '39', date: '2024-04-25', description: 'IKEA Home Decor', amount: 8900, type: 'debit', category: 'Shopping' },
    { id: '40', date: '2024-04-28', description: 'Mobile Recharge - Jio', amount: 599, type: 'debit', category: 'Bills & Utilities' },

    // May 2024
    { id: '41', date: '2024-05-05', description: 'Salary Credit - TechCorp Inc', amount: 90000, type: 'credit', category: 'Income' },
    { id: '42', date: '2024-05-07', description: 'Swiggy Instamart', amount: 1230, type: 'debit', category: 'Food & Dining' },
    { id: '43', date: '2024-05-10', description: 'Croma Electronics', amount: 15000, type: 'debit', category: 'Shopping' },
    { id: '44', date: '2024-05-12', description: 'Netflix Subscription', amount: 649, type: 'debit', category: 'Subscriptions' },
    { id: '45', date: '2024-05-15', description: 'Electricity Bill - BSES', amount: 3200, type: 'debit', category: 'Bills & Utilities' },
    { id: '46', date: '2024-05-18', description: 'Metro Card Recharge', amount: 500, type: 'debit', category: 'Travel' },
    { id: '47', date: '2024-05-19', description: 'Bonus Credit', amount: 50000, type: 'credit', category: 'Income' },
    { id: '48', date: '2024-05-22', description: 'Spotify Premium', amount: 119, type: 'debit', category: 'Subscriptions' },
    { id: '49', date: '2024-05-25', description: 'Apollo Pharmacy', amount: 1560, type: 'debit', category: 'Health' },
    { id: '50', date: '2024-05-28', description: 'Zerodha Investment', amount: 20000, type: 'debit', category: 'Transfer' },

    // June 2024
    { id: '51', date: '2024-06-05', description: 'Salary Credit - TechCorp Inc', amount: 90000, type: 'credit', category: 'Income' },
    { id: '52', date: '2024-06-07', description: 'Zomato Gold', amount: 1200, type: 'debit', category: 'Subscriptions' },
    { id: '53', date: '2024-06-10', description: 'Reliance Digital', amount: 7890, type: 'debit', category: 'Shopping' },
    { id: '54', date: '2024-06-12', description: 'Netflix Subscription', amount: 649, type: 'debit', category: 'Subscriptions' },
    { id: '55', date: '2024-06-15', description: 'Internet Bill - Airtel', amount: 1199, type: 'debit', category: 'Bills & Utilities' },
    { id: '56', date: '2024-06-18', description: 'Uber Ride', amount: 456, type: 'debit', category: 'Travel' },
    { id: '57', date: '2024-06-20', description: 'Friday Night Dinner', amount: 2300, type: 'debit', category: 'Food & Dining' },
    { id: '58', date: '2024-06-22', description: 'Spotify Premium', amount: 119, type: 'debit', category: 'Subscriptions' },
    { id: '59', date: '2024-06-25', description: 'Rent Payment', amount: 25000, type: 'debit', category: 'Bills & Utilities' },
    { id: '60', date: '2024-06-28', description: 'Freelance Payment', amount: 35000, type: 'credit', category: 'Income' },
];

// Get sample data for a specific date range
export function getMockTransactionsForRange(startDate: Date, endDate: Date): Transaction[] {
    return mockTransactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
    });
}
