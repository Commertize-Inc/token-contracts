import React from 'react';
import styles from './PropertyCard.module.css';
import { MapPin, Star, TrendingUp, Calendar, Building2, Percent, Sparkles } from 'lucide-react';

export interface PropertyData {
  id: string;
  name: string;
  location?: string;
  address?: string;
  imageUrl?: string;
  propertyValue?: number;
  pricePerToken?: number;
  minInvestment: number;
  totalTokens?: number;
  tokensAvailable?: number;
  tokensSold?: number;
  status?: string;
  propertyType?: string;
  assetType?: string;
  type?: string;
  targetedIRR?: number;
  tokenizedRaiseTarget?: number;
  loanToValue?: number;
  ltv?: number;
  distributionFrequency?: string;
  squareFeet?: number;
  squareFootage?: number;
  buildingSize?: number;
  capRate?: number;
  yearBuilt?: number;
  constructionYear?: number;
  netOperatingIncome?: number;
  units?: number;
  totalUnits?: number;
  numberOfUnits?: number;
  holdPeriod?: number;
  comingSoon?: boolean;
  sponsorEntityName?: string;
  sponsorFirstName?: string;
  sponsorLastName?: string;
}

interface PropertyCardProps {
  property: PropertyData;
  onClick?: () => void;
  onFavoriteClick?: (e: React.MouseEvent) => void;
  isFavorited?: boolean;
  showFavoriteButton?: boolean;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onFavoriteClick,
  isFavorited = false,
  showFavoriteButton = true,
  className = ''
}) => {
  const tokensSoldPercentage = (() => {
    if (property.tokensSold && property.totalTokens && property.totalTokens > 0) {
      return ((property.tokensSold / property.totalTokens) * 100).toFixed(1);
    }
    if (property.totalTokens && property.tokensAvailable !== undefined && property.totalTokens > 0) {
      const soldTokens = Math.max(0, property.totalTokens - property.tokensAvailable);
      return ((soldTokens / property.totalTokens) * 100).toFixed(1);
    }
    return '0.0';
  })();

  const getPropertyTypeDisplay = () => {
    const type = property.assetType || property.type || property.propertyType;
    const typeDisplayMap: { [key: string]: string } = {
      'strip-mall': 'Strip Mall',
      'shopping-center': 'Shopping',
      'mixed-use': 'Mixed-Use',
      'office': 'Office',
      'retail': 'Retail',
      'industrial': 'Industrial',
      'multifamily': 'Multifamily',
      'warehouse': 'Warehouse',
      'hotel': 'Hotel',
      'hospitality': 'Hotel',
      'medical': 'Medical',
      'self-storage': 'Storage',
      'data-center': 'Data Center',
      'flex-space': 'Flex'
    };
    return type ? (typeDisplayMap[type] || type) : 'Property';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const handleCardClick = () => {
    if (onClick) onClick();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteClick) onFavoriteClick(e);
  };

  return (
    <div
      className={`${styles.card} ${className}`}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.imageContainer}>
        <div className={styles.imageGradient} />
        
        {property.comingSoon && (
          <div className={styles.comingSoonBadge}>
            COMING SOON
          </div>
        )}
        
        <img
          src={property.imageUrl || '/assets/building-modern.jpg'}
          alt={property.name}
          className={styles.image}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('building-modern.jpg')) {
              target.src = '/assets/building-modern.jpg';
            }
          }}
        />

        {!property.comingSoon && (
          <div className={styles.statusBadge}>
            {property.status || 'Available'}
          </div>
        )}

        {!property.comingSoon && showFavoriteButton && (
          <button
            className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={styles.starIcon} />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.overview}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{property.name}</h3>
            <div className={styles.typeChip}>
              <span>{getPropertyTypeDisplay()}</span>
            </div>
          </div>
          <div className={styles.location}>
            <MapPin className={styles.locationIcon} />
            <span>{property.location || property.address || 'Location not specified'}</span>
          </div>
          
          {!property.comingSoon && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Tokens Sold</span>
                <span>{tokensSoldPercentage}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${Math.min(100, parseFloat(tokensSoldPercentage))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {!property.comingSoon && (
          <div className={styles.investmentInfo}>
            <div className={styles.valueRow}>
              <div className={styles.valueItem}>
                <div className={styles.valueLabel}>Property Value</div>
                <div className={styles.valueAmount}>
                  {property.propertyValue ? formatCurrency(property.propertyValue) : 'TBD'}
                </div>
              </div>
              <div className={styles.tokenPrice}>
                <div className={styles.tokenPriceLabel}>Token Price</div>
                <div className={styles.tokenPriceCircle}>
                  <span>{property.pricePerToken ? `$${property.pricePerToken}` : 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.metricsGrid}>
              {property.targetedIRR && (
                <div className={styles.metricItem}>
                  <TrendingUp className={styles.metricIcon} />
                  <span className={styles.metricLabel}>IRR</span>
                  <span className={styles.metricValue}>{property.targetedIRR}%</span>
                </div>
              )}
              {property.capRate && (
                <div className={styles.metricItem}>
                  <Percent className={styles.metricIcon} />
                  <span className={styles.metricLabel}>Cap Rate</span>
                  <span className={styles.metricValue}>{property.capRate}%</span>
                </div>
              )}
              {property.holdPeriod && (
                <div className={styles.metricItem}>
                  <Calendar className={styles.metricIcon} />
                  <span className={styles.metricLabel}>Hold</span>
                  <span className={styles.metricValue}>{property.holdPeriod}y</span>
                </div>
              )}
              {(property.units || property.totalUnits || property.numberOfUnits) && (
                <div className={styles.metricItem}>
                  <Building2 className={styles.metricIcon} />
                  <span className={styles.metricLabel}>Units</span>
                  <span className={styles.metricValue}>
                    {property.units || property.totalUnits || property.numberOfUnits}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.minInvestment}>
              <span className={styles.minLabel}>Min Investment</span>
              <span className={styles.minValue}>{formatCurrency(property.minInvestment)}</span>
            </div>
          </div>
        )}

        {property.comingSoon && (
          <div className={styles.comingSoonContent}>
            <p>This property will be available for investment soon. Stay tuned for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
