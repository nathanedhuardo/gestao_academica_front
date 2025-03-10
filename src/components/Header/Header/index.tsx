"use client";

import Image from "next/image";
import style from "./header.module.scss";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getStorageItem, setStorageItem } from "@/utils/localStore";
import Link from "next/link";
import { postLogout } from "@/api/auth/postLogout";

// Interface para o usuário
interface HeaderProps {
  usuario: { nome: string; email: string } | null;
}

// Função para detectar cliques fora de um elemento
const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, callback]);
};

const Header: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [usuario, setUsuario] = useState<{ nome: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRoles = JSON.parse(getStorageItem("userRoles") || "[]");
    const storedUsuario = JSON.parse(getStorageItem("usuario") || "null");

    setRoles(storedRoles);
    setUsuario(storedUsuario);
    setIsLoading(false);
  }, []);

  const renderLayout = () => {
    if (roles.includes("administrador")) {
      return <LayoutAdmin usuario={usuario} />;
    } if (roles.includes("estudante")) {
      return <LayoutAdmin usuario={usuario} />;
    } if (roles.includes("tecnico")) {
      return <LayoutAdmin usuario={usuario} />;
    } if (roles.includes("professor")) {
      return <LayoutAdmin usuario={usuario} />;
    } if (roles.includes("visitante")) {
      return <LayoutAdmin usuario={usuario} />;
    } else {
      return <LayoutPublic usuario={usuario} />;
    }
  };

  return <div>{renderLayout()}</div>;
};

const LayoutAdmin: React.FC<HeaderProps> = ({ usuario }) => {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => setOpen(false));
  useOutsideClick(dropdownRef, () => setDropdown(false));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    postLogout().then(() => {
      setStorageItem("token", "");
      setStorageItem("refresh_token", "");
      setStorageItem("usuario", "");
      setStorageItem("userRoles", "");
      push("/login");
    });
  };

  return (
    <div className={style.header}>
      <button className={style.header__button_burguer} onClick={() => setOpen(!open)}>
        <Image src="/assets/icons/burger.svg" alt="Menu" width={23} height={14} />
      </button>
      {open && (
        <div ref={menuRef} className={style.header__side_menu}>
          <div className={style.header__side_menu__content}>
            <div className={style.header__side_menu__content__header}>
              <button
                className={style.header__side_menu__content__header__button_back}
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/assets/icons/BackWhite.svg"
                  alt="Voltar"
                  width={27}
                  height={24}
                  style={{ transform: "scaleX(-1)" }}
                />
              </button>
              <div className={style.header__side_menu__content__header_iconLogin}>
                <Image src="/assets/icons/perfil.svg" alt="Perfil" width={50} height={50} />
                <h3 className={style.header__side_menu__content__header_iconLogin_nome}>
                  {usuario?.nome}
                </h3>
                <h3 className={style.header__side_menu__content__header_iconLogin_email}>
                  {usuario?.email}
                </h3>
              </div>
            </div>
            <div className={style.header__side_menu__content__main}>
              <div className={style.header__side_menu__conj}>
                <div className={style.header__side_menu__conjBotoes}>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image
                      src="/assets/icons/solicitacoes.svg"
                      alt="Solicitações"
                      width={27}
                      height={24}
                    />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/solicitacoes"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Solicitações</h1>
                    </Link>
                  </div>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image src="/assets/icons/usuarios.svg" alt="Usuários" width={27} height={24} />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/usuarios"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Usuários</h1>
                    </Link>
                  </div>
                </div>
              </div>
              <button
                className={style.header__side_menu__content__main__perfil}
                onClick={() => push("/perfil")}
              >
                <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
                <p>Meu Perfil</p>
              </button>
              <button
                className={style.header__side_menu__content__main__exit}
                onClick={handleLogout}
              >
                <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
                <p>Sair</p>
              </button>
            </div>
          </div>
          <div className={style.header__side_menu__space} onClick={() => setOpen(false)}></div>
        </div>
      )}
      <button className={style.header__button_link} onClick={() => push("/")}>
        <Image className={style.header__logo} src="/assets/LogoAzul.svg" alt="Logo App" width={40} height={40} />
      </button>
      <div className={style.header__usuarioLogado}>
        <h3 className={style.header__usuarioLogado_h3}>
          Olá, {usuario?.nome }
        </h3>
        <button className={style.header__button_perfil} onClick={() => setDropdown(!dropdown)}>
          <Image src="/assets/icons/profile.png" alt="Perfil" width={50} height={50} />
        </button>
        {dropdown && (
          <div ref={dropdownRef} className={style.header__dropdown}>
            <button
              className={style.header__dropdown__perfil}
              onClick={() => push("/perfil")}
            >
              <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
              <p>Meu Perfil</p>
            </button>
            <button
              className={style.header__dropdown__exit}
              onClick={handleLogout}
            >
              <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
              <p>Sair</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const LayoutVisitante: React.FC<HeaderProps> = ({ usuario }) => {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => setOpen(false));
  useOutsideClick(dropdownRef, () => setDropdown(false));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    postLogout().then(() => {
      setStorageItem("token", "");
      setStorageItem("refresh_token", "");
      setStorageItem("usuario", "");
      setStorageItem("userRoles", "");
      push("/login");
    });
  };

  return (
    <div className={style.header}>
      <button className={style.header__button_burguer} onClick={() => setOpen(!open)}>
        <Image src="/assets/icons/burger.svg" alt="Menu" width={23} height={14} />
      </button>
      {open && (
        <div ref={menuRef} className={style.header__side_menu}>
          <div className={style.header__side_menu__content}>
            <div className={style.header__side_menu__content__header}>
              <button
                className={style.header__side_menu__content__header__button_back}
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/assets/icons/BackWhite.svg"
                  alt="Voltar"
                  width={27}
                  height={24}
                  style={{ transform: "scaleX(-1)" }}
                />
              </button>
              <div className={style.header__side_menu__content__header_iconLogin}>
                <Image src="/assets/icons/perfil.svg" alt="Perfil" width={50} height={50} />
                <h3 className={style.header__side_menu__content__header_iconLogin_nome}>
                  {usuario?.nome}
                </h3>
                <h3 className={style.header__side_menu__content__header_iconLogin_email}>
                  {usuario?.email}
                </h3>
              </div>
            </div>
            <div className={style.header__side_menu__content__main}>
              <div className={style.header__side_menu__conj}>
                <div className={style.header__side_menu__conjBotoes}>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image
                      src="/assets/icons/solicitacoes.svg"
                      alt="Solicitações"
                      width={27}
                      height={24}
                    />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/solicitacoes"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Solicitações</h1>
                    </Link>
                  </div>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image src="/assets/icons/usuarios.svg" alt="Usuários" width={27} height={24} />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/usuarios"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Usuários</h1>
                    </Link>
                  </div>
                </div>
              </div>
              <button
                className={style.header__side_menu__content__main__perfil}
                onClick={() => push("/perfil")}
              >
                <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
                <p>Meu Perfil</p>
              </button>
              <button
                className={style.header__side_menu__content__main__exit}
                onClick={handleLogout}
              >
                <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
                <p>Sair</p>
              </button>
            </div>
          </div>
          <div className={style.header__side_menu__space} onClick={() => setOpen(false)}></div>
        </div>
      )}
      <button className={style.header__button_link} onClick={() => push("/")}>
        <Image className={style.header__logo} src="/assets/LogoAzul.svg" alt="Logo App" width={40} height={40} />
      </button>
      <div className={style.header__usuarioLogado}>
        <h3 className={style.header__usuarioLogado_h3}>
          Olá, {usuario?.nome }
        </h3>
        <button className={style.header__button_perfil} onClick={() => setDropdown(!dropdown)}>
          <Image src="/assets/icons/profile.png" alt="Perfil" width={50} height={50} />
        </button>
        {dropdown && (
          <div ref={dropdownRef} className={style.header__dropdown}>
            <button
              className={style.header__dropdown__perfil}
              onClick={() => push("/perfil")}
            >
              <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
              <p>Meu Perfil</p>
            </button>
            <button
              className={style.header__dropdown__exit}
              onClick={handleLogout}
            >
              <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
              <p>Sair</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const LayoutAluno: React.FC<HeaderProps> = ({ usuario }) => {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => setOpen(false));
  useOutsideClick(dropdownRef, () => setDropdown(false));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    postLogout().then(() => {
      setStorageItem("token", "");
      setStorageItem("refresh_token", "");
      setStorageItem("usuario", "");
      setStorageItem("userRoles", "");
      push("/login");
    });
  };

  return (
    <div className={style.header}>
      <button className={style.header__button_burguer} onClick={() => setOpen(!open)}>
        <Image src="/assets/icons/burger.svg" alt="Menu" width={23} height={14} />
      </button>
      {open && (
        <div ref={menuRef} className={style.header__side_menu}>
          <div className={style.header__side_menu__content}>
            <div className={style.header__side_menu__content__header}>
              <button
                className={style.header__side_menu__content__header__button_back}
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/assets/icons/BackWhite.svg"
                  alt="Voltar"
                  width={27}
                  height={24}
                  style={{ transform: "scaleX(-1)" }}
                />
              </button>
              <div className={style.header__side_menu__content__header_iconLogin}>
                <Image src="/assets/icons/perfil.svg" alt="Perfil" width={50} height={50} />
                <h3 className={style.header__side_menu__content__header_iconLogin_nome}>
                  {usuario?.nome}
                </h3>
                <h3 className={style.header__side_menu__content__header_iconLogin_email}>
                  {usuario?.email}
                </h3>
              </div>
            </div>
            <div className={style.header__side_menu__content__main}>
              <div className={style.header__side_menu__conj}>
                <div className={style.header__side_menu__conjBotoes}>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image
                      src="/assets/icons/solicitacoes.svg"
                      alt="Solicitações"
                      width={27}
                      height={24}
                    />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/solicitacoes"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Solicitações</h1>
                    </Link>
                  </div>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image src="/assets/icons/usuarios.svg" alt="Usuários" width={27} height={24} />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/usuarios"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Usuários</h1>
                    </Link>
                  </div>
                </div>
              </div>
              <button
                className={style.header__side_menu__content__main__perfil}
                onClick={() => push("/perfil")}
              >
                <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
                <p>Meu Perfil</p>
              </button>
              <button
                className={style.header__side_menu__content__main__exit}
                onClick={handleLogout}
              >
                <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
                <p>Sair</p>
              </button>
            </div>
          </div>
          <div className={style.header__side_menu__space} onClick={() => setOpen(false)}></div>
        </div>
      )}
      <button className={style.header__button_link} onClick={() => push("/")}>
        <Image className={style.header__logo} src="/assets/LogoAzul.svg" alt="Logo App" width={40} height={40} />
      </button>
      <div className={style.header__usuarioLogado}>
        <h3 className={style.header__usuarioLogado_h3}>
          Olá, {usuario?.nome }
        </h3>
        <button className={style.header__button_perfil} onClick={() => setDropdown(!dropdown)}>
          <Image src="/assets/icons/profile.png" alt="Perfil" width={50} height={50} />
        </button>
        {dropdown && (
          <div ref={dropdownRef} className={style.header__dropdown}>
            <button
              className={style.header__dropdown__perfil}
              onClick={() => push("/perfil")}
            >
              <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
              <p>Meu Perfil</p>
            </button>
            <button
              className={style.header__dropdown__exit}
              onClick={handleLogout}
            >
              <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
              <p>Sair</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const LayoutProfessor: React.FC<HeaderProps> = ({ usuario }) => {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => setOpen(false));
  useOutsideClick(dropdownRef, () => setDropdown(false));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    postLogout().then(() => {
      setStorageItem("token", "");
      setStorageItem("refresh_token", "");
      setStorageItem("usuario", "");
      setStorageItem("userRoles", "");
      push("/login");
    });
  };

  return (
    <div className={style.header}>
      <button className={style.header__button_burguer} onClick={() => setOpen(!open)}>
        <Image src="/assets/icons/burger.svg" alt="Menu" width={23} height={14} />
      </button>
      {open && (
        <div ref={menuRef} className={style.header__side_menu}>
          <div className={style.header__side_menu__content}>
            <div className={style.header__side_menu__content__header}>
              <button
                className={style.header__side_menu__content__header__button_back}
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/assets/icons/BackWhite.svg"
                  alt="Voltar"
                  width={27}
                  height={24}
                  style={{ transform: "scaleX(-1)" }}
                />
              </button>
              <div className={style.header__side_menu__content__header_iconLogin}>
                <Image src="/assets/icons/perfil.svg" alt="Perfil" width={50} height={50} />
                <h3 className={style.header__side_menu__content__header_iconLogin_nome}>
                  {usuario?.nome}
                </h3>
                <h3 className={style.header__side_menu__content__header_iconLogin_email}>
                  {usuario?.email}
                </h3>
              </div>
            </div>
            <div className={style.header__side_menu__content__main}>
              <div className={style.header__side_menu__conj}>
                <div className={style.header__side_menu__conjBotoes}>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image
                      src="/assets/icons/solicitacoes.svg"
                      alt="Solicitações"
                      width={27}
                      height={24}
                    />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/solicitacoes"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Solicitações</h1>
                    </Link>
                  </div>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image src="/assets/icons/usuarios.svg" alt="Usuários" width={27} height={24} />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/usuarios"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Usuários</h1>
                    </Link>
                  </div>
                </div>
              </div>
              <button
                className={style.header__side_menu__content__main__perfil}
                onClick={() => push("/perfil")}
              >
                <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
                <p>Meu Perfil</p>
              </button>
              <button
                className={style.header__side_menu__content__main__exit}
                onClick={handleLogout}
              >
                <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
                <p>Sair</p>
              </button>
            </div>
          </div>
          <div className={style.header__side_menu__space} onClick={() => setOpen(false)}></div>
        </div>
      )}
      <button className={style.header__button_link} onClick={() => push("/")}>
        <Image className={style.header__logo} src="/assets/LogoAzul.svg" alt="Logo App" width={40} height={40} />
      </button>
      <div className={style.header__usuarioLogado}>
        <h3 className={style.header__usuarioLogado_h3}>
          Olá, {usuario?.nome }
        </h3>
        <button className={style.header__button_perfil} onClick={() => setDropdown(!dropdown)}>
          <Image src="/assets/icons/profile.png" alt="Perfil" width={50} height={50} />
        </button>
        {dropdown && (
          <div ref={dropdownRef} className={style.header__dropdown}>
            <button
              className={style.header__dropdown__perfil}
              onClick={() => push("/perfil")}
            >
              <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
              <p>Meu Perfil</p>
            </button>
            <button
              className={style.header__dropdown__exit}
              onClick={handleLogout}
            >
              <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
              <p>Sair</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const LayoutTecnico: React.FC<HeaderProps> = ({ usuario }) => {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(menuRef, () => setOpen(false));
  useOutsideClick(dropdownRef, () => setDropdown(false));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    postLogout().then(() => {
      setStorageItem("token", "");
      setStorageItem("refresh_token", "");
      setStorageItem("usuario", "");
      setStorageItem("userRoles", "");
      push("/login");
    });
  };

  return (
    <div className={style.header}>
      <button className={style.header__button_burguer} onClick={() => setOpen(!open)}>
        <Image src="/assets/icons/burger.svg" alt="Menu" width={23} height={14} />
      </button>
      {open && (
        <div ref={menuRef} className={style.header__side_menu}>
          <div className={style.header__side_menu__content}>
            <div className={style.header__side_menu__content__header}>
              <button
                className={style.header__side_menu__content__header__button_back}
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/assets/icons/BackWhite.svg"
                  alt="Voltar"
                  width={27}
                  height={24}
                  style={{ transform: "scaleX(-1)" }}
                />
              </button>
              <div className={style.header__side_menu__content__header_iconLogin}>
                <Image src="/assets/icons/perfil.svg" alt="Perfil" width={50} height={50} />
                <h3 className={style.header__side_menu__content__header_iconLogin_nome}>
                  {usuario?.nome}
                </h3>
                <h3 className={style.header__side_menu__content__header_iconLogin_email}>
                  {usuario?.email}
                </h3>
              </div>
            </div>
            <div className={style.header__side_menu__content__main}>
              <div className={style.header__side_menu__conj}>
                <div className={style.header__side_menu__conjBotoes}>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image
                      src="/assets/icons/solicitacoes.svg"
                      alt="Solicitações"
                      width={27}
                      height={24}
                    />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/solicitacoes"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Solicitações</h1>
                    </Link>
                  </div>
                  <div className={style.header__side_menu__conjBotoes__botoesNav}>
                    <Image src="/assets/icons/usuarios.svg" alt="Usuários" width={27} height={24} />
                    <Link
                      className={style.header__side_menu__conjBotoes__link}
                      href="/usuarios"
                      onClick={() => setOpen(false)}
                    >
                      <h1>Usuários</h1>
                    </Link>
                  </div>
                </div>
              </div>
              <button
                className={style.header__side_menu__content__main__perfil}
                onClick={() => push("/perfil")}
              >
                <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
                <p>Meu Perfil</p>
              </button>
              <button
                className={style.header__side_menu__content__main__exit}
                onClick={handleLogout}
              >
                <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
                <p>Sair</p>
              </button>
            </div>
          </div>
          <div className={style.header__side_menu__space} onClick={() => setOpen(false)}></div>
        </div>
      )}
      <button className={style.header__button_link} onClick={() => push("/")}>
        <Image className={style.header__logo} src="/assets/LogoAzul.svg" alt="Logo App" width={40} height={40} />
      </button>
      <div className={style.header__usuarioLogado}>
        <h3 className={style.header__usuarioLogado_h3}>
          Olá, {usuario?.nome }
        </h3>
        <button className={style.header__button_perfil} onClick={() => setDropdown(!dropdown)}>
          <Image src="/assets/icons/profile.png" alt="Perfil" width={50} height={50} />
        </button>
        {dropdown && (
          <div ref={dropdownRef} className={style.header__dropdown}>
            <button
              className={style.header__dropdown__perfil}
              onClick={() => push("/perfil")}
            >
              <Image src="/assets/icons/iconLogadoGray.svg" alt="Meu Perfil" width={27} height={24} />
              <p>Meu Perfil</p>
            </button>
            <button
              className={style.header__dropdown__exit}
              onClick={handleLogout}
            >
              <Image src="/assets/icons/download.svg" alt="Sair" width={27} height={24} />
              <p>Sair</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LayoutPublic: React.FC<HeaderProps> = ({ usuario }) => {
  const { push } = useRouter();
  return (
    <div className={style.header}>
      <button className={style.header__button_link} onClick={() => push("/")}>
        <Image className={style.header__logo} src="/assets/LogoAzul.svg" alt="Logo App" width={40} height={40} />
      </button>
      <div className={style.header__container}>
       
        <button className={style.header__button_link} onClick={() => push("/")}>
          Home
        </button>
        <button className={style.header__button_link} onClick={() => push("/")}>
          Sistema
        </button>
      </div>
    </div>
  );
};

export default Header;
