import { Navigate, useParams } from 'react-router-dom'

export default function RedirectSecteur() {
    const { id } = useParams()
    return <Navigate to={`/sectors/${id}`} replace />
}
