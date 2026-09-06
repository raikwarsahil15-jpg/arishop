// Function in Checkout logic
const validateVipAccess = async (user, product) => {
  if (product.isVIP && !user.isVIP) {
    throw new Error("Access Denied: VIP Membership Required");
  }
};