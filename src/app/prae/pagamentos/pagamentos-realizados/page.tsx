"use client"
import withAuthorization from '@/components/AuthProvider/withAuthorization';
import Cabecalho from '@/components/Layout/Interno/Cabecalho';
import Tabela from '@/components/Tabela/Estrutura';
import { generica } from '@/utils/api';
import { NoMeals } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const estrutura: any = {

    uri: "/prae/pagamento",  //caminho base

    cabecalho: { //cabecalho da pagina
        titulo: "Pagamentos Realizados",
        migalha: [
            { nome: 'Home', link: '/home' },
            { nome: 'Prae', link: '/prae' },
            { nome: 'Pagamentos Realizados', link: '/prae/pagamentos-realizados' },
        ]
    },
    tabela: {
        configuracoes: {
            pesquisar: true,//campo pesquisar nas colunas (booleano)
            cabecalho: true,//cabecalho da tabela (booleano)
            rodape: true,//rodape da tabela (booleano)
        },
        botoes: [
        ],
        colunas: [ //colunas da tabela
            { nome: "CPF ", chave: "estudante.cpf", tipo: "texto", selectOptions: null, sort: false, pesquisar: true },
            { nome: "Tipo Pagamento", chave: "beneficio.tipoBeneficio.tipo", tipo: "texto", selectOptions: null, sort: false, pesquisar: true }, //nome(string),chave(string),tipo(text,select),selectOpcoes([{chave:string, valor:string}]),pesquisar(booleano)
            { nome: "Valor Pago", chave: "valor", tipo: "texto", selectOptions: null, sort: false, pesquisar: true }, //nome(string),chave(string),tipo(text,select),selectOpcoes([{chave:string, valor:string}]),pesquisar(booleano)
            { nome: "Data Pagamento ", chave: "data", tipo: "texto", selectOptions: null, sort: false, pesquisar: true }, //nome(string),chave(string),tipo(text,select),selectOpcoes([{chave:string, valor:string}]),pesquisar(booleano)
            { nome: "ações", chave: "acoes", tipo: "button", selectOptions: null, sort: false, pesquisar: false },
        ],
        acoes_dropdown: [ //botão de acoes de cada registro
            { nome: 'Editar', chave: 'editar' }, //nome(string),chave(string),bloqueado(booleano)
            { nome: 'Deletar', chave: 'deletar' },
        ]
    }

}

const PageLista = () => {
    const router = useRouter();
    const [dados, setDados] = useState<any>({ content: [] });

    const chamarFuncao = (nomeFuncao = "", valor: any = null) => {
        switch (nomeFuncao) {
            case 'pesquisar':
                pesquisarRegistro(valor);
                break;
            case 'adicionar':
                adicionarRegistro();
                break;
            case 'editar':
                editarRegistro(valor);
                break;
            case 'deletar':
                deletarRegistro(valor);
                break;
            default:
                break;
        }
    }
    // Função para carregar os dados
    const formatarDataBR = (dataISO: string | null) => {
        if (!dataISO || typeof dataISO !== 'string') return dataISO;

        const partes = dataISO.split("-");
        if (partes.length !== 3) return dataISO;

        const [ano, mes, dia] = partes;
        return `${dia}/${mes}/${ano}`;
    };

    const pesquisarRegistro = async (params = null) => {
        try {
            let body = {
                metodo: 'get',
                uri: estrutura.uri,
                params: params != null ? params : { size: 10, page: 0 },
                data: {}
            };

            const response = await generica(body);
            console.log("✅ Resposta recebida:", response);

            if (response?.data?.errors !== undefined) {
                toast("Erro. Tente novamente!", { position: "bottom-left" });
            } else if (response?.data?.error !== undefined) {
                toast(response.data.error.message, { position: "bottom-left" });
            } else if (Array.isArray(response?.data)) {
                const dadosFormatados = response?.data.map((item: any) => ({
                    ...item,
                    data: formatarDataBR(item?.data ?? null)
                }));

                setDados({ content: dadosFormatados }); // ou só setDados(dadosFormatados), depende da sua tabela
            } else {
                toast.error("Resposta inesperada da API (esperado um array).", { position: "top-left" });
                console.error("❌ Estrutura inesperada:", response?.data);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar registros:', error);
            toast.error("Erro ao carregar registros", { position: "top-left" });
        }
    };



    // Função que redireciona para a tela adicionar
    const adicionarRegistro = () => {
        router.push('');
    };
    // Função que redireciona para a tela editar
    const editarRegistro = (item: any) => {
        router.push('/prae/pagamentos/' + item.id);
    };
    // Função que deleta um registro
    const deletarRegistro = async (item: any) => {
        const confirmacao = await Swal.fire({
            title: `Você deseja deletar o pagameto ${item.id}?`, // Trocar para o nome do usuario quando atualizar
            text: "Essa ação não poderá ser desfeita",
            icon: "warning",
            showCancelButton: true,

            // Ajuste as cores conforme seu tema
            confirmButtonColor: "#1A759F",
            cancelButtonColor: "#9F2A1A",

            confirmButtonText: "Sim, quero deletar!",
            cancelButtonText: "Cancelar",

            // Classes personalizadas
            customClass: {
                popup: "my-swal-popup",
                title: "my-swal-title",
                htmlContainer: "my-swal-html",
            },
        });


        if (confirmacao.isConfirmed) {
            try {
                const body = {
                    metodo: 'delete',
                    uri: estrutura.uri + '/' + item.id,
                    params: {},
                    data: {}
                };

                const response = await generica(body);

                if (response && response.data && response.data.errors) {
                    toast.error("Erro. Tente novamente!", { position: "top-left" });
                } else if (response && response.data && response.data.error) {
                    toast.error(response.data.error.message, { position: "top-left" });
                } else {
                    pesquisarRegistro();
                    Swal.fire({
                        title: "Pagamento deletado com sucesso!",
                        icon: "success"
                    });
                }
            } catch (error) {
                console.error('Erro ao deletar registro:', error);
                toast.error("Erro ao deletar registro. Tente novamente!", { position: "top-left" });
            }
        }
    };

    useEffect(() => {
        chamarFuncao('pesquisar', null);
    }, []);

    return (
        <main className="flex flex-wrap justify-center mx-auto">
            {/* 
      Em telas muito pequenas: w-full, p-4
      A partir de sm (>=640px): p-6
      A partir de md (>=768px): p-8
      A partir de lg (>=1024px): p-12
      A partir de xl (>=1280px): p-16
      A partir de 2xl (>=1536px): p-20 e w-10/12
    */}
            <div className="w-full sm:w-11/12 2xl:w-10/12 p-4 sm:p-6 md:p-8 lg:p-12 :p-16 2xl:p-20 pt-7 md:pt-8 md:pb-8 ">
                <Cabecalho dados={estrutura.cabecalho} />
                <Tabela
                    dados={dados}
                    estrutura={estrutura}
                    chamarFuncao={chamarFuncao}
                />
            </div>
        </main>

    );
};

export default withAuthorization(PageLista);