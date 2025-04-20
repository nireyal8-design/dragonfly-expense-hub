import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div>
      {/* or wherever your main page link is */}
      <Link 
        to="/expense-tracking-benefits" 
        className="hover:text-dragonfly-600 transition-colors"
      >
        מעקב הוצאות
      </Link>
    </div>
  );
};

export default Dashboard; 