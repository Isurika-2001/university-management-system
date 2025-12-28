import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Collapse, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

// ant design icons
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

// project import
import NavItem from './NavItem';
import { activeItem } from 'store/reducers/menu';

// ==============================|| NAVIGATION - COLLAPSE ITEM ||============================== //

const NavCollapse = ({ item, level, defaultExpanded }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { drawerOpen, openItem } = useSelector((state) => state.menu);

  // Initialize expanded state based on defaultExpanded prop and openItem from Redux
  const [open, setOpen] = useState(defaultExpanded || false);

  // Check if any children match the current pathname
  useEffect(() => {
    if (pathname) {
      const isActive = item.children?.some((child) => pathname.includes(child.url));
      if (isActive && !open) {
        setOpen(true);
      }
    }
    // eslint-disable-next-line
  }, [pathname]);

  const handleClick = () => {
    setOpen(!open);
    dispatch(activeItem({ openItem: [item.id] }));
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : false;
  const isSelected = openItem.findIndex((id) => id === item.id) > -1;

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';

  return (
    <>
      {/* Collapse Header Button */}
      <ListItemButton
        onClick={handleClick}
        disabled={item.disabled}
        sx={{
          zIndex: 1201,
          pl: drawerOpen ? `${level * 28 + 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            '&:hover': {
              bgcolor: 'primary.lighter'
            },
            '&.Mui-selected': {
              bgcolor: 'primary.lighter',
              borderRight: `2px solid ${theme.palette.primary.main}`,
              color: iconSelectedColor,
              '&:hover': {
                color: iconSelectedColor,
                bgcolor: 'primary.lighter'
              }
            }
          }),
          ...(!drawerOpen && {
            '&:hover': {
              bgcolor: 'transparent'
            },
            '&.Mui-selected': {
              '&:hover': {
                bgcolor: 'transparent'
              },
              bgcolor: 'transparent'
            }
          })
        }}
        selected={isSelected}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: isSelected ? iconSelectedColor : textColor,
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'secondary.lighter'
                }
              })
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {drawerOpen && (
          <>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ color: textColor }}>
                  {item.title}
                </Typography>
              }
            />
            {open ? <CaretUpOutlined style={{ fontSize: '0.875rem' }} /> : <CaretDownOutlined style={{ fontSize: '0.875rem' }} />}
          </>
        )}
      </ListItemButton>

      {/* Collapse Content */}
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {item.children?.map((menuItem) => {
              switch (menuItem.type) {
                case 'item':
                  return <NavItem key={menuItem.id} item={menuItem} level={level + 1.5} />;
                case 'collapse':
                  return <NavCollapse key={menuItem.id} item={menuItem} level={level + 1} defaultExpanded={false} />;
                default:
                  return (
                    <Typography key={menuItem.id} variant="h6" color="error" align="center">
                      Fix - Collapse Item
                    </Typography>
                  );
              }
            })}
          </Box>
        </Collapse>
      )}
    </>
  );
};

NavCollapse.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  defaultExpanded: PropTypes.bool
};

export default NavCollapse;
