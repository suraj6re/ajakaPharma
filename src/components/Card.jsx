import React from 'react';

const Card = ({ title, value, icon, subtitle, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600'
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${
                trend.type === 'up' ? 'text-green-600' : 
                trend.type === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend.type === 'up' ? '↗️' : trend.type === 'down' ? '↘️' : '➡️'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
