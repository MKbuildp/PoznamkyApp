import AsyncStorage from '@react-native-async-storage/async-storage';

const resetStorage = async () => {
  try {
    await AsyncStorage.removeItem('seznamPrijmuData_v2');
    console.log('✅ Data byla úspěšně vymazána');
  } catch (error) {
    console.error('❌ Chyba při mazání dat:', error);
  }
};

resetStorage(); 