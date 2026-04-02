import React from 'react';
import Link from 'next/link';
import SpkButton from './spk-button';

interface LinkButtonProps {
  Navigate?: string;
  // Se heredan todas las propiedades definidas en Buttontypes
  bsPrefix?: string;
  as?: any;
  Buttonvariant?: string;
  Buttontype?: 'button' | 'reset' | 'submit' | undefined;
  Customclass?: string;
  children?: React.ReactNode;
  Dismiss?: boolean;
  Closebutton?: string;
  Value?: string;
  Buttontoggle?: string;
  Expand?: boolean;
  Id?: string;
  Buttondismiss?: string;
  Buttontarget?: string;
  Role?: string;
  Buttoncontrols?: string;
  Buttonlabel?: string;
  Style?: React.CSSProperties;
  Size?: 'sm' | 'lg';
  Active?: boolean;
  Tabindex?: number | undefined;
  Disabled?: boolean;
  onClickfunc?: any;
  onChangefunc?: React.ChangeEventHandler<HTMLButtonElement>;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  Navigate,
  children,
  ...props
}) => {
  // Si se pasa una ruta, se utiliza Link para el enrutado
  if (Navigate) {
    return (
      <Link href={Navigate} passHref>
          <SpkButton {...props}>{children}</SpkButton>
      </Link>
    );
  }

  // Si no se indica una ruta, se muestra el botón normal
  return <SpkButton {...props}>{children}</SpkButton>;
};

export default LinkButton;
