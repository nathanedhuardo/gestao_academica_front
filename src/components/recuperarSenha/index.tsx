"use client";

import style from "./recuperarSenha.module.scss";

const RecuperarSenha = () => {
    return (
        <>
            <div className={style.header}>
                <div className={style.header__title}>
                    <h1>Recuperar Senha</h1>
                    <div className={style.header__title_line}></div>
                </div>
            </div>

            <div className={style.container}>
                <div className={style.container__recup}>
                    <h2>Esqueceu sua senha?</h2>
                    <p>Enviaremos um email com instruções de como redefinir sua senha.</p>
                    <div className={style.container__input}>
                        <label htmlFor="email" className={style.label}>
                            <p>E-mail</p>
                            <input
                                className={style.label__input}
                                type="email"
                                name="email"
                                placeholder="Digite seu e-mail"
                            />
                        </label>
                    </div>
                    <div className={style.container__button}>
                        <button className={style.container__button_button} >Enviar</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecuperarSenha;