import { useRoute, useNavigation } from '@react-navigation/native';

export function getPrevRouteName(navigation: any) {

    const routes = navigation.getState()?.routes;
    if (routes) {
      const prevRoute = routes[routes.length - 2];
      console.log("prevRoute", prevRoute);
      let prevRouteName = prevRoute.params?.screen;

      if (prevRouteName==undefined) {
        prevRouteName = prevRoute.state?.routeNames?.[prevRoute.state.index ?? 0] ?? null;
      } 
      console.log("prevRouteName", prevRouteName);
      return lookUpName(prevRouteName);
    }

  return null;
}

function lookUpName(routeName: string) {
  switch (routeName) {
    case 'planned_walks':
      return 'Calendar';
    case 'index':
      return 'Home';
    case 'new_walk':
      return 'New Walk';
    case 'select_walk':
      return 'Find a walk';
    default:
      return routeName;
  }
}