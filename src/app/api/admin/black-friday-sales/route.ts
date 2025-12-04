import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAccess();

    const client = await pool.connect();
    
    try {
      // Get total sales stats
      const totalStatsQuery = `
        SELECT 
          COUNT(*) as total_sales,
          SUM(amount) as total_revenue,
          COUNT(DISTINCT user_id) as unique_customers,
          AVG(amount) as average_order_value
        FROM black_friday_sales
        WHERE payment_status = 'completed'
      `;

      // Get sales by plan type
      const planTypeQuery = `
        SELECT 
          plan_type,
          COUNT(*) as sales_count,
          SUM(amount) as revenue
        FROM black_friday_sales
        WHERE payment_status = 'completed'
        GROUP BY plan_type
      `;

      // Get sales by tier (for LTD)
      const tierQuery = `
        SELECT 
          tier,
          COUNT(*) as sales_count,
          SUM(amount) as revenue,
          AVG(amount) as avg_amount
        FROM black_friday_sales
        WHERE payment_status = 'completed' AND plan_type = 'ltd' AND tier IS NOT NULL
        GROUP BY tier
        ORDER BY tier
      `;

      // Get sales over time (last 30 days)
      const salesOverTimeQuery = `
        SELECT 
          DATE(created_at) as sale_date,
          COUNT(*) as sales_count,
          SUM(amount) as daily_revenue
        FROM black_friday_sales
        WHERE payment_status = 'completed' 
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY sale_date DESC
      `;

      // Get recent sales (last 20)
      const recentSalesQuery = `
        SELECT 
          id,
          transaction_id,
          tx_ref,
          amount,
          currency,
          user_id,
          user_email,
          user_name,
          plan_type,
          tier,
          monthly_credits,
          created_at
        FROM black_friday_sales
        WHERE payment_status = 'completed'
        ORDER BY created_at DESC
        LIMIT 20
      `;

      // Get hourly sales (last 24 hours)
      const hourlySalesQuery = `
        SELECT 
          DATE_TRUNC('hour', created_at) as sale_hour,
          COUNT(*) as sales_count,
          SUM(amount) as hourly_revenue
        FROM black_friday_sales
        WHERE payment_status = 'completed' 
          AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY sale_hour DESC
      `;

      // Get top customers
      const topCustomersQuery = `
        SELECT 
          user_id,
          user_email,
          user_name,
          COUNT(*) as purchase_count,
          SUM(amount) as total_spent
        FROM black_friday_sales
        WHERE payment_status = 'completed'
        GROUP BY user_id, user_email, user_name
        ORDER BY total_spent DESC
        LIMIT 10
      `;

      const [
        totalStats,
        planTypeStats,
        tierStats,
        salesOverTime,
        recentSales,
        hourlySales,
        topCustomers
      ] = await Promise.all([
        client.query(totalStatsQuery),
        client.query(planTypeQuery),
        client.query(tierQuery),
        client.query(salesOverTimeQuery),
        client.query(recentSalesQuery),
        client.query(hourlySalesQuery),
        client.query(topCustomersQuery)
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalStats: {
            totalSales: parseInt(totalStats.rows[0]?.total_sales || '0'),
            totalRevenue: parseFloat(totalStats.rows[0]?.total_revenue || '0'),
            uniqueCustomers: parseInt(totalStats.rows[0]?.unique_customers || '0'),
            averageOrderValue: parseFloat(totalStats.rows[0]?.average_order_value || '0'),
          },
          planTypeStats: planTypeStats.rows.map(row => ({
            planType: row.plan_type,
            salesCount: parseInt(row.sales_count || '0'),
            revenue: parseFloat(row.revenue || '0'),
          })),
          tierStats: tierStats.rows.map(row => ({
            tier: row.tier,
            salesCount: parseInt(row.sales_count || '0'),
            revenue: parseFloat(row.revenue || '0'),
            avgAmount: parseFloat(row.avg_amount || '0'),
          })),
          salesOverTime: salesOverTime.rows.map(row => ({
            date: row.sale_date,
            salesCount: parseInt(row.sales_count || '0'),
            revenue: parseFloat(row.daily_revenue || '0'),
          })),
          recentSales: recentSales.rows.map(row => ({
            id: row.id,
            transactionId: row.transaction_id,
            txRef: row.tx_ref,
            amount: parseFloat(row.amount || '0'),
            currency: row.currency,
            userId: row.user_id,
            userEmail: row.user_email,
            userName: row.user_name,
            planType: row.plan_type,
            tier: row.tier,
            monthlyCredits: row.monthly_credits,
            createdAt: row.created_at,
          })),
          hourlySales: hourlySales.rows.map(row => ({
            hour: row.sale_hour,
            salesCount: parseInt(row.sales_count || '0'),
            revenue: parseFloat(row.hourly_revenue || '0'),
          })),
          topCustomers: topCustomers.rows.map(row => ({
            userId: row.user_id,
            userEmail: row.user_email,
            userName: row.user_name,
            purchaseCount: parseInt(row.purchase_count || '0'),
            totalSpent: parseFloat(row.total_spent || '0'),
          })),
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Black Friday sales analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch Black Friday sales analytics' 
      },
      { status: 500 }
    );
  }
}




