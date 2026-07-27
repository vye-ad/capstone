import { useParams } from 'react-router-dom';

export default function CountryDetail() {
  const { cca2 } = useParams();
  return <div>Country detail: {cca2}</div>;
}
