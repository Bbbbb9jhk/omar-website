import { createContext, useContext, type ComponentProps } from 'react';
export const PathContext = createContext('/');
export function usePathname() { return useContext(PathContext); }
export default function Link(props: ComponentProps<'a'>) { return <a {...props} />; }
