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
  const [dadosPreenchidos, setDadosPreenchidos] = useState<any>({ endereco: {} });

  const isEditMode = id && id !== "criar";

  const estrutura: any = {
    uri: "usuario",
    cabecalho: {
      titulo: isEditMode ? "Visualizar Usuário" : "Cadastrar Usuário",
      migalha: [
        { nome: 'Início', link: '/home' },
        { nome: 'PRAE', link: '/prae' },
        { nome: "Usuários", link: "/prae/usuarios" },
      ],
    },
    cadastro: {
      campos: [
        {
          line: 1,
          colSpan: "md:col-span-2",
          nome: "Nome",
          chave: "nome",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
          bloqueado: true,
        },
        {
          line: 1,
          colSpan: "md:col-span-2",
          nome: "Nome Social",
          chave: "nomeSocial",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
          bloqueado: true,
        },
        {
          line: 1,
          colSpan: "md:col-span-2",
          nome: "E-mail",
          chave: "email",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
          bloqueado: true,
        },
        {
          line: 2,
          colSpan: "md:col-span-1",
          nome: "CPF",
          chave: "cpf",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
          mascara: "cpf",
          bloqueado: true,
        },
        {
          line: 2,
          colSpan: "md:col-span-1",
          nome: "Telefone",
          chave: "telefone",
          tipo: "text",
          mensagem: "Digite",
          obrigatorio: true,
          mascara: "celular",
          bloqueado: true,
        },
      ],
      acoes: [
        { nome: "Voltar", chave: "voltar", tipo: "botao" },
      ],
    },
  };

  const chamarFuncao = async (nomeFuncao = "", valor: any = null) => {
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
    router.push("/prae/usuarios");
  };

  const salvarRegistro = async (item: any) => {
    try {
      const body = {
        metodo: "post",
        uri: "/" + estrutura.uri,
        params: {},
        data: item,
      };

      const response = await generica(body);

      if (!response || response.status < 200 || response.status >= 300) {
        toast(`Erro na requisição (HTTP ${response?.status || "desconhecido"})`, { position: "top-left" });
        return;
      }

      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast(response.data.error.message, { position: "top-left" });
      } else {
        Swal.fire({
          title: "Usuário salvo com sucesso!",
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            chamarFuncao("voltar");
          }
        });
      }
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      toast.error("Erro ao salvar registro. Tente novamente!", { position: "top-left" });
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
        throw new Error("Resposta inválida do servidor.");
      }

      if (response.data?.errors) {
        Object.keys(response.data.errors).forEach((campoErro) => {
          toast(`Erro em ${campoErro}: ${response.data.errors[campoErro]}`, {
            position: "top-left",
          });
        });
      } else if (response.data?.error) {
        toast(response.data.error.message, { position: "top-left" });
      } else {
        const data = response.data;
        const endereco = data.endereco || {};
        const dadosAchatados = {
          ...data,
          cep: endereco.cep || "",
          logradouro: endereco.logradouro || "",
          complemento: endereco.complemento || "",
          numero: endereco.numero || "",
          bairro: endereco.bairro || "",
          municipio: endereco.municipio || "",
          estado: endereco.estado || "",
        };

        setDadosPreenchidos(dadosAchatados);
      }
    } catch (error) {
      console.error("Erro ao localizar registro:", error);
      toast.error("Erro ao localizar registro. Tente novamente!", { position: "top-left" });
    }
  };

  useEffect(() => {
    if (id && id !== "criar") {
      chamarFuncao("editar", id);
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
        />
      </div>
    </main>
  );
};

export default withAuthorization(cadastro);
