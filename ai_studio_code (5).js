const updateOrderStatus = async (orderId, newStatus) => {
  // 1. Update order status in Firestore
  // 2. If 'Delivered', add to User's 'totalSpent' for Weekly Top Customer tracking
  // 3. Send notification to user
};