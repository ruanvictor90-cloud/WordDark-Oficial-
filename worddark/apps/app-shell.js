const BRIEFS = {
  sky: {sector:"Céu · Execução", needs:["Catálogo de capacidades, serviços disponíveis e versão de cada executor.","Fila de trabalhos com estado, origem, prioridade, prazo e responsável.","Detalhe do trabalho: entrada autorizada, dependências, artefatos, validação, falhas e resultado.","Histórico de execução ligado à operação de origem."], limits:"O Céu executa capacidades encaminhadas. Não assume autoridade global, propriedade dos clientes nem decisões comerciais."},
  terra: {sector:"Terra · Necessidades externas", needs:["Entidades, clientes, empresas e canais com origem dos dados.","Necessidades e pedidos com contexto, prioridade, anexos e destino pretendido.","Estado de qualificação, encaminhamento, entrega e confirmação.","Histórico por entidade e indicação clara de informação pendente ou verificada."], limits:"Pesquisa externa não comprova fornecedor. Pedido enviado não significa compra, pagamento ou entrega."},
  darkfactory: {sector:"Céu · Produção", needs:["Entrada do pedido autorizado e tipo de serviço.","Campos específicos por serviço, arquivos de referência e critérios de aceite.","Estado/progresso, bloqueios, erros e versões.","Prévia de entregáveis, validação, revisão e solicitação de ajustes.","Registro de entrega e relação com o pedido de origem."], limits:"Produção e publicação são etapas separadas. Nesta fase, a execução é assistida por pessoa; não alegar geração automática."},
  "social-operations": {sector:"Terra · Conteúdos e canais", needs:["Clientes, contas e canais com estado real de autorização.","Pautas, calendário e fila por canal.","Conteúdo aprovado, destino, regras da plataforma e validações.","Histórico de tentativas, recibos e links externos quando existirem.","Métricas com fonte e data verificáveis."], limits:"Tokens nunca ficam no navegador. Publicação externa permanece manual até integração e autorização reais."},
  marketing: {sector:"Céu · Marketing", needs:["Objetivo, público, posicionamento e período.","Oportunidades e fontes de pesquisa com data e confiança.","Campanhas, canais, orçamento e criativos relacionados à Biblioteca/Dark Factory.","Aprovações, resultados, limites de orçamento e alertas."], limits:"Não declarar campanhas ou métricas conectadas sem fonte externa confirmada. Não iniciar gasto sem autorização."},
  "project-management": {sector:"Terra · Projetos", needs:["Projetos e tarefas com responsável, prazo, prioridade e estado.","Dependências, bloqueios, comentários e aprovações.","Entregáveis vinculados a operações do WordDark.","Custos previstos separados de custos realizados."], limits:"Estimativas e registros locais não devem ser apresentados como dados financeiros confirmados."},
  "business-operations": {sector:"Terra · Negócios", needs:["Produtos/serviços, clientes, fornecedores e origem de preços/estoque.","Ofertas, pedidos e status de aceite.","Etapas de venda, entrega, ocorrência e pós-venda.","Histórico de comunicação e comprovantes."], limits:"Não assumir estoque, pagamento, compra, logística ou entrega externos sem confirmação real."},
  connections: {sector:"WordDark · Infraestrutura compartilhada", needs:["Catálogo de provedores e estado da conexão.","Contas autorizadas, capacidades e escopos concedidos.","Ações de conectar, testar, renovar e revogar com confirmação.","Diagnóstico, quotas, últimas verificações e auditoria."], limits:"Segredos e tokens ficam no backend. OAuth ou conta persistida não concede capacidade operacional automaticamente."},
  library: {sector:"WordDark · Conhecimento e artefatos", needs:["Pesquisa por título, tipo, setor, origem, etiquetas e operação.","Metadados, autoria/proveniência, datas e versões.","Estado de revisão: pendente, validado, aprovado, arquivado ou substituído.","Permissões e relação entre artefato, pedido e resultado."], limits:"Conteúdo recebido da Darknet é candidato até passar pela revisão exigida. Biblioteca não autoriza nem executa."},
  "security-governance": {sector:"WordDark · Segurança e governança", needs:["Identidades, permissões e capacidades por ator/setor.","Aprovações pendentes e motivo das decisões.","Auditoria com ator, ação, operação, horário e resultado.","Alertas, incidentes, recuperação e parada de emergência."], limits:"Exigir autenticação forte; nunca expor tokens, segredos ou conteúdo sensível desnecessário."},
  "operations-center": {sector:"WordDark · Core e Rodovia", needs:["Fila de operações com estados normalizados e origem/destino.","Linha do tempo, dependências, IDs de correlação e auditoria.","Falhas, motivo, tentativas e próxima ação segura.","Reentrada idempotente, cancelamento e reconciliação de estado incerto."], limits:"Não tratar snapshot em memória como registro durável. A interface não é um segundo orquestrador."},
  "world-school": {sector:"WordDark · Aprendizado", needs:["Guias e lições por setor, versão e público.","Origem e evidência que sustentam cada orientação.","Estado de rascunho, revisão, aprovado e obsoleto.","Pesquisa e histórico de atualização."], limits:"Separar hipótese, recomendação e regra operacional validada."},
  darkbank: {sector:"WordDark · Gestão financeira interna", needs:["Livro-caixa com receita, custo, taxas, horas, reservas e obrigações.","Separação de estimativa, proposta, faturamento e recebimento confirmado.","Reconciliação, aprovações, limites e trilha de auditoria.","Relatórios de caixa e margem por operação."], limits:"Não é banco autorizado. Não misturar com o Financeiro do Ruan nem alegar movimentação real sem integração autorizada."},
  "commercial-intake": {sector:"Terra · Captação comercial", needs:["Lead, necessidade observável, origem e contexto.","Qualificação por capacidade, prazo, orçamento e riscos.","Proposta individual com escopo, preço, prazo, limites e aceite explícito.","Histórico de contato e transições de estado."], limits:"Lead não é venda. Não enviar proposta nem assumir compromisso automaticamente."},
  "first-sale-operations": {sector:"Terra + Céu · Primeira venda", needs:["Lead e proposta aceita com escopo confirmado.","Responsável, prazo, custo previsto e estado da execução.","Entregáveis reais, revisão, confirmação de entrega e ajustes.","Recebimento manual conferido, custos reais e resultado líquido."], limits:"A versão de painel existente está numa branch separada e ainda não foi integrada a staging. Não tratar armazenamento local como sincronização."}
};
const shellOnly = new Set(Object.keys(BRIEFS));
const getParam = name => new URLSearchParams(window.location.search).get(name);
const safe = value => String(value ?? "");
async function loadCatalog(){
  const response = await fetch("../runtime/world/APP-CATALOG.json", {cache:"no-store"});
  if(!response.ok) throw new Error("CATALOG_UNAVAILABLE");
  return response.json();
}
function addText(parent, tag, className, value){
  const node=document.createElement(tag);
  if(className) node.className=className;
  node.textContent=safe(value);
  parent.append(node);
  return node;
}
function openBrief(app){
  const brief=BRIEFS[app.id];
  const dialog=document.getElementById("requirements-dialog");
  document.getElementById("dialog-title").textContent="O que esta interface precisa ter?";
  document.getElementById("dialog-intro").textContent=app.name+": "+app.responsibility;
  document.getElementById("dialog-limits").textContent=brief?.limits || "A interface só poderá executar ações que estejam disponíveis e autorizadas no backend.";
  const list=document.getElementById("requirements-list");
  list.replaceChildren();
  (brief?.needs || ["Finalidade e público do app.","Entradas, validações, saídas e estados.","Permissões, fontes de dados, erros e histórico.","Critérios de aceite e preferências visuais a definir pelo usuário."]).forEach(item=>addText(list,"li","",item));
  if(typeof dialog.showModal==="function") dialog.showModal(); else dialog.setAttribute("open","");
}
async function init(){
  const catalog=await loadCatalog();
  const id=getParam("app");
  if(id){
    const app=catalog.apps.find(item=>item.id===id && shellOnly.has(item.id));
    if(!app){
      document.getElementById("app-title").textContent="App não encontrado";
      document.getElementById("app-responsibility").textContent="Este espaço não está registrado para o shell mínimo.";
      document.getElementById("open-requirements").hidden=true;
      return;
    }
    document.title=app.name+" · WordDark";
    document.getElementById("system-name").textContent="WORDDARK";
    document.getElementById("app-sector").textContent=BRIEFS[id]?.sector || app.area;
    document.getElementById("app-title").textContent=app.name;
    document.getElementById("app-responsibility").textContent=app.responsibility;
    document.getElementById("open-requirements").addEventListener("click",()=>openBrief(app));
    openBrief(app);
    return;
  }
  const list=document.getElementById("app-list");
  list.replaceChildren();
  catalog.apps.filter(app=>shellOnly.has(app.id)).forEach(app=>{
    const link=document.createElement("a");
    link.className="app-card";
    link.href="./app-shell.html?app="+encodeURIComponent(app.id);
    const mark=addText(link,"span","app-mark","◇");
    mark.setAttribute("aria-hidden","true");
    const content=document.createElement("span");
    addText(content,"strong","",app.name);
    addText(content,"small","",app.responsibility);
    addText(content,"span","tag","IDENTIDADE + BRIEF");
    link.append(content);
    list.append(link);
  });
}
init().catch(()=>{
  const target=document.getElementById("app-list");
  if(target) target.textContent="Não foi possível carregar o catálogo de apps. Nenhuma operação foi executada.";
  const title=document.getElementById("app-title");
  if(title) title.textContent="Catálogo indisponível";
});
