import {connection} from 'next/server';
import AdminDashboard from '../../components/AdminDashboard';
import './admin.css';
export const metadata={title:'Project studio',robots:{index:false,follow:false}};
export default async function Admin(){await connection();return <AdminDashboard/>}
