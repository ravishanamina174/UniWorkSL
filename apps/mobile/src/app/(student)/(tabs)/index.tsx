import { Redirect, type Href } from 'expo-router';

export default function StudentIndex() { return <Redirect href={'/(student)/(tabs)/dashboard' as Href} />; }
