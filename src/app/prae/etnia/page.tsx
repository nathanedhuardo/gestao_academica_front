"use client"
import withAuthorization from '@/components/AuthProvider/withAuthorization';
import Cabecalho from '@/components/Layout/Interno/Cabecalho';
import Tabela from '@/components/Tabela/Estrutura';
import { generica } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const estrutura: any = {
  uri: "tipoEtnia", // caminho base do backend: /tipoEtnia

  cabecalho: {
    titulo: "Tipo Etnia",
    migalha: [
      { nome: 'Início', link: '/home' },
      { nome: 'PRAE', link: '/prae' },
      { nome: 'Tipo Etnia', link: '/prae/etnia' },
    ]
  },

  tabela: {
    configuracoes: {
      pesquisar: true,
      cabecalho: true,
      rodape: true,
    },
    botoes: [
      { nome: 'Adicionar', chave: 'adicionar', bloqueado: false },
    ],
    colunas: [
      { nome: "Tipo Etnia", chave: "tipo", tipo: "texto", selectOptions: null, sort: false, pesquisar: true },
      { nome: "ações", chave: "acoes", tipo: "button", selectOptions: null, sort: false, pesquisar: false },
    ],
    acoes_dropdown: [
      { nome: 'Editar', chave: 'editar' },
      { nome: 'Deletar', chave: 'deletar' },
    ]
  }
};

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
  };
  
  const pesquisarRegistro = async (params = null) => {
    try {
      let body = {
        metodo: 'get',
        uri: '/' + estrutura.uri,
        params: params != null ? params : { size: 10, page: 0 },
        data: {}
      };
      const response = await generica(body);
      if (response && response.data.errors != undefined) {
        toast("Erro. Tente novamente!", { position: "bottom-left" });
      } else if (response && response.data.error != undefined) {
        toast(response.data.error.message, { position: "bottom-left" });
      } else {
        if (response && response.data) {
          setDados(response.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const adicionarRegistro = () => {
    router.push('/prae/etnia/criar');
  };
  
  const editarRegistro = (item: any) => {
    router.push('/prae/etnia/' + item.id);
  };

  const deletarRegistro = async (item: any) => {
    const confirmacao = await Swal.fire({
      title: `Você deseja deletar a etnia: ${item.tipo || item.etnia}?`,
      text: "Essa ação não poderá ser desfeita",
      icon: "warning",
      iconColor: "#972E3F",
      showCancelButton: true,
      confirmButtonColor: "#393C47",
      cancelButtonColor: "#9F2A1A",
      confirmButtonText: "Sim, quero deletar!",
      cancelButtonText: "Cancelar",
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
          uri: '/' + estrutura.uri + '/' + item.id,
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
            title: "Etnia deletada com sucesso!",
            confirmButtonColor: "#972E3F",
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
      <div className="w-full sm:w-11/12 2xl:w-10/12 p-4 sm:p-6 md:p-8 lg:p-12 2xl:p-20 pt-7 md:pt-8 md:pb-8">
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
