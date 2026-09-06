// Located in /src/screens/admin/ManageWeeklyTop.js
const AdminWeeklyPanel = () => {
  const [requests, setRequests] = useState([]);

  const approveRequest = async (userId) => {
    // Calling your specific Admin Action function
    const result = await adminActivateWeeklyProfile(userId);
    if(result.success) {
       // Refresh list
    }
  };

  return (
    <View>
      <Text>Pending Profile Requests</Text>
      {requests.map(req => (
        <View key={req.userId}>
          <Text>{req.userName} - Spent: ₹{req.totalSpent}</Text>
          <Button title="Activate for 7 Days" onPress={() => approveRequest(req.userId)} />
        </View>
      ))}
    </View>
  );
};