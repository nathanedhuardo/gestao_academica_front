"use client";
import withAuthorization from "@/components/AuthProvider/withAuthorization";
import Cadastro from "@/components/Cadastro/Estrutura";
import Cabecalho from "@/components/Layout/Interno/Cabecalho";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { generica } from "@/utils/api";

const cadastro = () => {
  const router = useRouter();
  const { id } = useParams();

  const [dadosPreenchidos, setDadosPreenchidos] = useState<any>({ 
    tipo: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = id && id !== "criar";

  const estrutura: any = {
    uri: "tipoEtnia",
    cabecalho: {
      titulo: isEditMode ? "Editar Etnia" : "Cadastrar Etnia",
      migalha: [
        { nome: 'Início', link: '/home' },
        { nome: 'PRAE', link: '/prae' },
        { nome: 'Tipo Etnia', link: '/prae/etnia' },
        {
          nome: isEditMode ? "Editar" : "Criar",
          link: `/prae/etnia/${isEditMode ? id : "criar"}`,
        },
      ],
    },
    cadastro: {
      campos: [
        {
          line: 1,
          colSpan: "md:col-span-1",
          nome: "Nome da Etnia",
          chave: "tipo",
          tipo: "text",
          mensagem: "Digite o nome da etnia",
          obrigatorio: true,
          placeholder: "Ex: Indígena, Afrodescendente, etc.",
        },
      ],
      acoes: [
        { nome: "Cancelar", chave: "voltar", tipo: "botao" },
        { nome: isEditMode ? "Salvar" : "Cadastrar", chave: "salvar", tipo: "submit" },
      ],
    },
  };

  const chamarFuncao = async (nomeFuncao = "", valor: any = null) => {
    toast.dismiss();
    
    switch (nomeFuncao) {
      case "salvar":
        await salvarRegistro(valor);
        break;
      case "voltar":
        voltarRegistro();
        break;
      case "editar":
        editarRegistro(valor);
        break;
      default:
        break;
    }
  };

  const voltarRegistro = () => {
    toast.dismiss(); 
    router.push("/prae/etnia");
  };

  const validarDados = (item: any) => {
    toast.dismiss();

    if (!item.tipo || item.tipo.trim() === '') {
      toast.error("O campo 'Nome da Etnia' é obrigatório.", {
        position: "top-left",
        autoClose: 5000,
        toastId: "nome-obrigatorio"
      });
      return false;
    }

    if (item.tipo.trim().length < 2) {
      toast.error("O nome da etnia deve ter pelo menos 2 caracteres.", {
        position: "top-left",
        autoClose: 5000,
        toastId: "nome-curto"
      });
      return false;
    }

    if (item.tipo.trim().length > 100) {
      toast.error("O nome da etnia não pode exceder 100 caracteres.", {
        position: "top-left",
        autoClose: 5000,
        toastId: "nome-longo"
      });
      return false;
    }

    return true;
  };

  const salvarRegistro = async (item: any) => {
    if (!validarDados(item)) {
      return;
    }

    if (isSubmitting) {
      toast.info("Aguarde, enviando dados...", {
        position: "top-left",
        toastId: "enviando-dados"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const body = {
        metodo: `${isEditMode ? "patch" : "post"}`,
        uri: "/" + `${isEditMode ? estrutura.uri + "/" + item.id : estrutura.uri}`,
        params: {},
        data: {
          tipo: item.tipo.trim() 
        },
      };
      
      const response = await generica(body);
      
      if (!response) {
        toast.error("Erro de conexão com o servidor. Verifique sua internet e tente novamente.", {
          position: "top-left",
          autoClose: 5000,
          toastId: "erro-conexao"
        });
        return;
      }

      if (response.status < 200 || response.status >= 300) {
        let mensagemErro = `Erro ao ${isEditMode ? "editar" : "cadastrar"} etnia.`;
        
        switch (response.status) {
          case 400:
            mensagemErro = "Dados inválidos. Verifique as informações preenchidas.";
            break;
          case 401:
            mensagemErro = "Sessão expirada. Faça login novamente.";
            break;
          case 403:
            mensagemErro = "Você não tem permissão para realizar esta ação.";
            break;
          case 404:
            mensagemErro = isEditMode ? "Etnia não encontrada." : "Recurso não encontrado.";
            break;
          case 409:
            mensagemErro = "Já existe uma etnia com este nome.";
            break;
          case 500:
            mensagemErro = "Erro interno do servidor. Tente novamente mais tarde.";
            break;
          default:
            mensagemErro = `Erro HTTP ${response.status}: Falha na operação.`;
        }
        
        toast.error(mensagemErro, {
          position: "top-left",
          autoClose: 5000,
          toastId: `http-error-${response.status}`
        });
        return;
      }

      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast.error(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
            autoClose: 5000,
            toastId: `campo-error-${campoErro}`
          });
        });
        return;
      }

      if (response.data?.error) {
        toast.error(response.data.error.message, { 
          position: "top-left",
          autoClose: 5000,
          toastId: "response-error"
        });
        return;
      }

      await Swal.fire({
        title: isEditMode ? "Etnia editada com sucesso!" : "Etnia cadastrada com sucesso!",
        icon: "success",
        customClass: {
          popup: "my-swal-popup",
          title: "my-swal-title",
          htmlContainer: "my-swal-html",
        },
        confirmButtonColor: "#972E3F",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 3000,
        timerProgressBar: true
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          chamarFuncao("voltar");
        }
      });

    } catch (error: any) {
      console.error("DEBUG: Erro ao salvar registro:", error);
      
      let mensagemErro = "Erro ao salvar registro. Tente novamente!";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          mensagemErro = errorData.message;
        } else if (errorData.error) {
          mensagemErro = errorData.error;
        }
      } else if (error.message) {
        mensagemErro = `Erro: ${error.message}`;
      }
      
      toast.error(mensagemErro, { 
        position: "top-left",
        autoClose: 5000,
        toastId: "catch-error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editarRegistro = async (item: any) => {
    try {
      const body = {
        metodo: "get",
        uri: "/" + estrutura.uri + "/" + item,
        params: {},
        data: item,
      };
      
      const response = await generica(body);
      
      if (!response) {
        toast.error("Erro de conexão ao carregar etnia.", {
          position: "top-left",
          autoClose: 5000,
          toastId: "editar-conexao-error"
        });
        return;
      }

      if (response.status < 200 || response.status >= 300) {
        let mensagemErro = "Erro ao carregar dados da etnia.";
        
        switch (response.status) {
          case 404:
            mensagemErro = "Etnia não encontrada.";
            break;
          case 401:
            mensagemErro = "Sessão expirada. Faça login novamente.";
            break;
          case 403:
            mensagemErro = "Você não tem permissão para acessar este recurso.";
            break;
          default:
            mensagemErro = `Erro HTTP ${response.status}`;
        }
        
        toast.error(mensagemErro, {
          position: "top-left",
          autoClose: 5000,
          toastId: `editar-http-error-${response.status}`
        });
        return;
      }

      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast.error(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
            autoClose: 5000,
            toastId: `editar-campo-error-${campoErro}`
          });
        });
        return;
      }

      if (response.data?.error) {
        toast.error(response.data.error.message, {
          position: "top-left",
          autoClose: 5000,
          toastId: "editar-response-error"
        });
      } else {
        setDadosPreenchidos({
          id: response.data.id,
          tipo: response.data.tipo || ""
        });
      }
    } catch (error) {
      console.error("DEBUG: Erro ao localizar registro:", error);
      toast.error("Erro ao carregar etnia. Tente novamente!", {
        position: "top-left",
        autoClose: 5000,
        toastId: "editar-catch-error"
      });
    }
  };

  useEffect(() => {
    toast.dismiss();
    
    if (id && id !== "criar") {
      chamarFuncao("editar", id);
    } else {
      setDadosPreenchidos({ tipo: "" });
    }
  }, [id]);

  return (
    <main className="flex flex-wrap justify-center mx-auto">
      <div className="w-full md:w-11/12 lg:w-10/12 2xl:w-3/4 max-w-6xl p-4 pt-10 md:pt-12 md:pb-12">
        <Cabecalho dados={estrutura.cabecalho} />
        <Cadastro
          estrutura={estrutura}
          dadosPreenchidos={dadosPreenchidos}
          setDadosPreenchidos={setDadosPreenchidos}
          chamarFuncao={chamarFuncao}
          isSubmitting={isSubmitting}
        />
      </div>
    </main>
  );
};

export default withAuthorization(cadastro);
