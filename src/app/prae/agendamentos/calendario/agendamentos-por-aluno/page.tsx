"use client"
import withAuthorization from '@/components/AuthProvider/withAuthorization';
import Cabecalho from '@/components/Layout/Interno/Cabecalho';
import Tabela from './tabela/tabela';
import { generica } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const estrutura: any = {
  uri: "agendamento",
  cabecalho: {
    titulo: "Agendamentos por Aluno",
    migalha: [
      { nome: 'Home', link: '/home' },
      { nome: 'Prae', link: '/prae' },
      { nome: 'Agendamentos por Aluno', link: '/prae/agendamentos/calendario/agendamentos-por-aluno' },
    ]
  },
  tabela: {
    configuracoes: {
      pesquisar: true,
      cabecalho: true,
      rodape: true,
    },
    botoes: [
      { nome: 'Todos os Agendamentos', chave: 'adicionar', bloqueado: false },
    ],
    colunas: [
      { nome: "Tipo de Atendimento", chave: "tipoAtendimento", tipo: "texto", selectOptions: null, sort: false, pesquisar: true },
      { nome: "Dia de Atendimento", chave: "data", tipo: "texto", selectOptions: null, sort: false, pesquisar: true },
      { nome: "Horário", chave: "vaga.horaInicio", tipo: "texto", selectOptions: null, sort: false, pesquisar: false },
      { nome: "ações", chave: "acoes", tipo: "button", selectOptions: null, sort: false, pesquisar: false },
    ],
    acoes_dropdown: [
      { nome: 'Deletar', chave: 'deletar' },
    ]
  }
}

const PageLista = () => {
  const router = useRouter();
  const [dados, setDados] = useState<any>({ content: [] });
  const [estudantes, setEstudantes] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);

  // Ref para autocomplete
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setSugestoes([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Buscar estudantes ao montar
  useEffect(() => {
    const buscarEstudantes = async () => {
      try {
        const body = {
          metodo: 'get',
          uri: '/estudantes',
          params: {},
          data: {}
        };
        const response = await generica(body);
        if (response && response.data) {
          setEstudantes(response.data);
        }
      } catch (error) {
        toast.error("Erro ao buscar estudantes");
      }
    };
    buscarEstudantes();
  }, []);

  // Atualiza sugestões conforme digita
  useEffect(() => {
    if (busca.length === 0) {
      setSugestoes([]);
      return;
    }
    const termo = busca.toLowerCase();
    setSugestoes(
      estudantes.filter(e =>
        e.aluno?.nome?.toLowerCase().includes(termo)
      )
    );
  }, [busca, estudantes]);

  // Busca agendamentos do aluno selecionado
  const buscarAgendamentosAluno = async (idAluno: number) => {
    try {
      let body = {
        metodo: 'get',
        uri: `/agendamento/estudante/${idAluno}`,
        params: {},
        data: {}
      }
      const response = await generica(body);
      if (response && response.data) {
        setDados({ content: response.data });
      } else {
        setDados({ content: [] });
      }
    } catch (error) {
      toast.error("Erro ao buscar agendamentos do aluno");
    }
  };

  // Quando seleciona um aluno da lista
  const selecionarAluno = (aluno: any) => {
    setAlunoSelecionado(aluno);
    setBusca(aluno.aluno?.nome || '');
    setSugestoes([]);
    buscarAgendamentosAluno(aluno.id);
  };

  const chamarFuncao = (nomeFuncao = "", valor: any = null) => {
    switch (nomeFuncao) {
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
  const adicionarRegistro = () => {
    router.push('/prae/agendamentos/calendario/todos-agendamentos');
  };
  const editarRegistro = (item: any) => {
    router.push('/prae/agendamentos/cronograma/' + item.id);
  };

  const formatarDataBR = (data: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const deletarRegistro = async (item: any) => {
    const confirmacao = await Swal.fire({
      title: `Você deseja cancelar o atendimento ${item.tipoAtendimento}, agendado para o dia ${formatarDataBR(item.data)}, às ${item.vaga.horaInicio}?`,
      text: "Essa ação não poderá ser desfeita",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1A759F",
      cancelButtonColor: "#9F2A1A",
      confirmButtonText: "Sim, eu quero!",
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
          metodo: 'post',
          uri: '/' + estrutura.uri + '/' + item.id + '/cancelar',
          params: {},
          data: {}
        };

        const response = await generica(body);

        if (response && response.data && response.data.errors) {
          toast.error("Erro. Tente novamente!", { position: "top-left" });
        } else if (response && response.data && response.data.error) {
          toast.error(response.data.error.message, { position: "top-left" });
        } else {
          if (alunoSelecionado) buscarAgendamentosAluno(alunoSelecionado.id);
          Swal.fire({
            title: "Agendamento cancelado com sucesso!",
            icon: "success"
          });
        }
      } catch (error) {
        console.error('Erro ao deletar registro:', error);
        toast.error("Erro ao deletar registro. Tente novamente!", { position: "top-left" });
      }
    }
  };

  return (
    <main className="flex flex-wrap justify-center mx-auto">
      <div className="w-full sm:w-11/12 2xl:w-10/12 p-4 sm:p-6 md:p-8 lg:p-12 :p-16 2xl:p-20 pt-7 md:pt-8 md:pb-8 ">
        <Cabecalho dados={estrutura.cabecalho} />

        {/* Input de busca com autocomplete */}
        <div className="mb-4 relative" ref={autocompleteRef}>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            placeholder="Digite o nome do aluno..."
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setAlunoSelecionado(null);
            }}
            autoComplete="off"
          />
          {sugestoes.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
              {sugestoes.map((aluno, idx) => (
                <li
                  key={aluno.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => selecionarAluno(aluno)}
                >
                  {aluno.aluno?.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Tabela
          dados={dados.content || []}
          estrutura={estrutura}
          chamarFuncao={chamarFuncao}
        />
      </div>
    </main>
  );
};

export default withAuthorization(PageLista);