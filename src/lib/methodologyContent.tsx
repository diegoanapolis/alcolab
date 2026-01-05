// Conteúdo da metodologia por etapa/seção
// Cada seção corresponde a uma etapa do fluxo Medir

import React from "react"

// ==================== SEÇÃO 1: TIPO DE SOLUÇÃO ====================
export const MethodologyTipoSolucao = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">1️⃣ Indique o tipo de solução hidroalcoólica</h3>
    
    <p>
      Esta metodologia foi estruturada, calibrada e testada exclusivamente para a análise de triagem 
      de soluções hidroalcoólicas cuja composição seja predominantemente (&gt;99.5%) formada por:
    </p>
    
    <ul className="list-disc pl-5 space-y-1">
      <li>Água</li>
      <li>Etanol</li>
      <li>Metanol</li>
    </ul>
    
    <p>
      Outros constituintes somente são aceitáveis em níveis traço, inferiores a 0,5% m/m, 
      não devendo interferir nas propriedades físicas do sistema.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Aplicações contempladas</h4>
    <p>São compatíveis com esta metodologia:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Bebidas destiladas puras ("secas") listadas no aplicativo</li>
      <li>Etanol combustível</li>
      <li>Etanol comercial</li>
      <li>Metanol</li>
      <li>Outras soluções hidroalcoólicas preparadas ou adquiridas, desde que contenham exclusivamente água, etanol e/ou metanol, em elevadas purezas</li>
    </ul>

    <h4 className="font-semibold text-red-700 mt-4">🚫 Não se aplica aos seguintes casos</h4>
    <ul className="list-disc pl-5 space-y-1 text-red-700">
      <li>Licores e bebidas adoçadas</li>
      <li>Cremes alcoólicos</li>
      <li>Bebidas fermentadas (vinho, cerveja, sidra, hidromel)</li>
      <li>Destilados saborizados</li>
      <li>Bebidas mistas e prontas (ex.: caipirinhas prontas)</li>
      <li>Bebidas turvas, com polpas, emulsões, óleos ou corantes densos</li>
      <li>Misturas caseiras não homogêneas (coquetéis)</li>
    </ul>
  </>
)

// ==================== SEÇÃO 2: DADOS DA AMOSTRA ====================
export const MethodologyDadosAmostra = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">2️⃣ Informe dados da amostra</h3>
    
    <p>
      Nesta etapa são informados os dados descritivos da amostra, que auxiliam na interpretação 
      dos resultados e na organização das análises dentro do aplicativo.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Campos solicitados (bebidas em geral)</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Teor indicado no rótulo (0.0 a 100.0)</li>
      <li>Unidade do teor de rótulo</li>
      <li>Nome da amostra</li>
      <li>Fabricante e/ou marca (opcional)</li>
      <li>Lote (opcional)</li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Outras soluções hidroalcoólicas</h4>
    <p>Pode ser solicitado também o teor de metanol esperado.</p>

    <h4 className="font-semibold text-[#002060] mt-4">Orientações importantes</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li>
        O teor de rótulo ou teor esperado é utilizado para verificação de compatibilidade 
        entre os resultados analíticos e a informação declarada.
      </li>
      <li>
        Para bebidas destiladas comercializadas no Brasil, na ausência de indicação explícita, 
        considere como padrão a unidade "% v/v – Bebidas", conforme prática regulatória.
      </li>
      <li>
        Informações como fabricante, marca e lote são opcionais, mas facilitam a localização, 
        filtragem e comparação de análises no histórico do aplicativo.
      </li>
    </ul>
  </>
)

// ==================== SEÇÃO 3: MASSA OU DENSIDADE ====================
export const MethodologyMassaDensidade = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">3️⃣ Meça massa ou densidade</h3>
    
    <p>
      Nesta etapa, o usuário pode escolher entre diferentes métodos, de modo a viabilizar 
      a execução do exame mesmo com poucos equipamentos (sendo obrigatório somente a seringa especificada).
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Método 1 — Aferição de massa (Balança)</h4>
    
    <p className="font-medium mt-2">Procedimento:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Aspire exatamente 20 mL de água para pesagem e, separadamente, 20 mL da amostra, utilizando a mesma seringa.</li>
      <li>Posicione o êmbolo exatamente na mesma marcação em ambos os casos.</li>
      <li>Realize uma única pesagem, pois a massa será utilizada apenas para estimativa inicial de densidade.</li>
      <li>A estimativa refinada da composição será obtida principalmente a partir do escoamento (viscosidade).</li>
    </ul>

    <p className="font-medium mt-3">Observações importantes:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Não é necessário que a graduação da seringa seja absolutamente exata, pois a metodologia trabalha em termos relativos à água, que é a referência do sistema.</li>
      <li>Caso a massa da seringa seja descontada externamente, pode-se informar massa da seringa = 0 no aplicativo.</li>
      <li>Recomenda-se pesar a seringa vazia, seca e completa (seringa + êmbolo + agulha), pois balanças domésticas podem perder a tara automaticamente.</li>
    </ul>

    <p className="font-medium mt-3">Cuidados práticos:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Utilize a seringa seca.</li>
      <li>Se houver dúvida quanto à umidade interna, enxágue duas vezes o interior da seringa com duas pequenas porções do próprio líquido a ser medido.</li>
      <li>Para remover bolhas:
        <ul className="list-disc pl-5 space-y-0.5 mt-1">
          <li>Aspire volume ligeiramente superior a 20 mL</li>
          <li>Com a agulha acoplada e voltada para cima, pressione o êmbolo lentamente até eliminar bolhas visíveis</li>
          <li>Repita o procedimento, se necessário</li>
        </ul>
      </li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Método 2 — Densímetro, alcôometro ou rótulo</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Utilize recipiente cilíndrico, permitindo que o instrumento flutue sem tocar as paredes.</li>
      <li>Aguarde estabilização do instrumento antes da leitura.</li>
    </ul>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Atenção — uso do teor de rótulo</p>
      <p className="text-yellow-800 mt-1">
        O uso do teor de rótulo reduz a seletividade da análise. Nesse caso, o exame passa a funcionar 
        simplesmente como checagem de compatibilidade entre o teor declarado e o comportamento de 
        escoamento (viscosidade), não excluindo outras composições hidroalcoólicas possíveis 
        (inclusive contendo metanol).
      </p>
    </div>
  </>
)

// ==================== SEÇÃO 4: TEMPERATURA ====================
export const MethodologyTemperatura = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">4️⃣ Meça a temperatura — água e amostra</h3>

    <h4 className="font-semibold text-[#002060] mt-4">Opção 1 — Possuo termômetro</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Meça a temperatura imediatamente antes ou após o escoamento.</li>
      <li>Recomenda-se medir em recipiente plástico, por ex., copo limpo ou recipiente coletor do descarte do escoamento, limpos.</li>
      <li>Diferenças de até 3 °C entre água e amostra são aceitáveis; o aplicativo realiza correção da viscosidade da água.</li>
      <li>Caso opte por medir após o escoamento: avance normalmente no fluxo do app; e depois retorne à tela de temperatura e atualize os valores. Os dados do escoamento serão preservados.</li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Opção 2 — Não possuo termômetro</h4>
    <p>
      É possível realizar o exame sem aferição direta de temperatura, desde que:
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Água, amostra e ambiente estejam em equilíbrio térmico</li>
      <li>Nenhuma das amostras tenha sido refrigerada</li>
      <li>Aguarde-se mínimo de 1 hora no ambiente do ensaio</li>
      <li>O ambiente deve estar entre 20 e 30 °C</li>
    </ul>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Atenção</p>
      <p className="text-yellow-800 mt-1">
        Se alguma amostra estava refrigerada, tempos maiores de equalização serão necessários. 
        O não atendimento desse requisito resultará em erro analítico.
      </p>
    </div>

    <p className="text-gray-600 italic mt-3 text-xs">
      Nota: A ausência de medição direta, quando respeitados os critérios acima, não reduz a qualidade 
      do exame, pois a viscosidade medida é sempre normalizada para 20 °C com base em dados de referência 
      (procedimento que independe da temperatura real, desde que dentro do intervalo de 20 a 30ºC).
    </p>
  </>
)

// ==================== SEÇÃO 5: ESCOAMENTO ====================
export const MethodologyEscoamento = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">5️⃣ Registre o escoamento</h3>
    
    <p>
      Esta é a etapa mais sensível da metodologia, responsável pelo ajuste fino da estimativa 
      de composição, com base nos princípios físicos do escoamento e da viscosidade.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Métodos disponíveis</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Estimativa por vídeo dos tempos entre 18 mL e 13 mL (mais recomendado)</li>
      <li>Inserção manual dos tempos totais de escoamento (menos recomendado)</li>
    </ul>

    <p className="font-bold text-[#002060] mt-3">
      Reforço: Utilize sempre o mesmo conjunto seringa + agulha (22G) para água e amostra.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Orientações gerais</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li>Considere a parte inferior do formato abaulado da superfície do líquido (chamado menisco) como referência na hora de identificar quando toca cada marcação da graduação da seringa.</li>
      <li>Pequenas diferenças de interpretação do menisco entre diferentes usuários não comprometem o resultado, desde que o usuário use o mesmo critério seja utilizado para água e amostra.</li>
      <li>Água e amostra devem ser escoadas no mesmo conjunto físico, preferencialmente no mesmo dia, e sem remover a agulha entre medições (há indícios de que desencaixar e reencaixar pode alterar levemente a dinâmica do escoamento).</li>
    </ul>

    <p className="text-gray-600 italic mt-2 text-xs">
      Recomendação operacional: Para múltiplas amostras no mesmo dia, utilize uma seringa dedicada 
      à pesagem da água e amostras, e outra dedicada exclusivamente aos escoamentos.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Cuidados práticos de execução</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Fixe a seringa sem êmbolo, com a agulha acoplada, em posição vertical.</li>
      <li>Utilize anteparo liso ao fundo.</li>
      <li>Posicione o celular paralelo à seringa com a câmera do celular na altura do corpo da seringa, a aproximadamente 50 cm dela.</li>
      <li>Se possível, fixe o foco da câmera no corpo da seringa.</li>
      <li>Inicie a gravação antes do menisco atingir 18 mL e finalize após ultrapassar 13 mL.</li>
    </ul>

    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3">
      <p className="font-semibold text-blue-800">💡 Dica para fixação da seringa</p>
      <p className="text-blue-800 mt-1">
        Utilize uma garrafinha plástica com duas aberturas recortadas em regiões opostas da parte superior, 
        de modo a permitir a visualização da graduação da seringa. A porção não recortada deve manter o bocal, 
        onde a seringa poderá ser posicionada e fixada pelas abas.
      </p>
    </div>

    <h4 className="font-semibold text-[#002060] mt-4">Inserção manual (menos recomendada)</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Posicione seus olhos alinhados (na altura) da marcação inicial 18 mL, quando for disparar o cronômetro, e alinhados à marcação 14 mL quando for interromper a contagem de tempo</li>
      <li>Inicie e finalize o cronômetro exatamente nos instantes de contato do menisco com as marcas</li>
      <li>Prefira utilizar o cronômetro do próprio aplicativo que já mede em segundos corridos</li>
    </ul>

    <p className="font-bold text-[#002060] mt-3">
      Repetições: Recomenda-se no mínimo duas repetições para água e duas para amostra. 
      O aplicativo permite análise com apenas uma repetição, porém com menor confiabilidade estatística.
    </p>
  </>
)

// ==================== SEÇÃO 6: REVISÃO ====================
export const MethodologyRevisao = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">6️⃣ Revise os dados antes do cálculo</h3>
    
    <p>
      Esta etapa permite a verificação final de todos os dados experimentais e informativos 
      antes do processamento dos resultados.
    </p>
    
    <p>
      Caso identifique qualquer inconsistência, utilize a seta de retorno do aplicativo para correção.
    </p>
    
    <p>Após a confirmação, o cálculo será realizado.</p>
  </>
)

// ==================== SEÇÃO 7: RELATÓRIO ====================
export const MethodologyRelatorio = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">7️⃣ Relatório | Exame de Triagem</h3>
    
    <p>
      Esta janela apresenta o resultado analítico consolidado do exame de triagem, incluindo:
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Dados experimentais utilizados</li>
      <li>Composições obtidas estatisticamente equivalentes</li>
      <li>Composição mais provável</li>
      <li>Síntese interpretativa dos resultados</li>
      <li>Avisos e limitações do método</li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Sobre as composições equivalentes</h4>
    <p>
      ℹ️ Composições equivalentes correspondem a possibilidades que, considerando a variabilidade 
      experimental e os testes estatísticos aplicados (teste Z e simulações de Monte Carlo), 
      não podem ser distinguidas entre si. Em outras palavras, tratam-se de composições diferentes 
      que poderiam conduzir aos resultados experimentais obtidos.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Sobre teores baixos reportados</h4>
    <p>
      ℹ️ Teores inferiores a 5% tendem a ter sua relevância reduzida na interpretação dos resultados, 
      uma vez que esta metodologia não demonstrou sensibilidade adequada para a detecção de 
      concentrações abaixo desse limite.
    </p>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Lembre-se</p>
      <p className="text-yellow-800 mt-1">
        Este exame não é confirmatório e não substitui análises laboratoriais oficiais.
        Em casos suspeitos, NÃO CONSUMA a bebida, mesmo com resultados aparentemente normais.
      </p>
    </div>
  </>
)

// ==================== TOOLTIPS PARA RESULTADOS ====================
export const TooltipComposicoesEquivalentes = "Composições equivalentes correspondem a possibilidades que, considerando a variabilidade experimental dos ensaios e os testes estatísticos aplicados (teste Z e simulações de Monte Carlo), não podem ser distinguidas entre si. Em outras palavras, tratam-se de composições diferentes que poderiam conduzir aos resultados experimentais obtidos."

export const TooltipTeoresBaixos = "Teores inferiores a 5% tendem a ter sua relevância reduzida na interpretação dos resultados, uma vez que esta metodologia não demonstrou sensibilidade adequada para a detecção de concentrações abaixo desse limite."

export const TooltipMonteCarlo = "Simulação probabilística de Monte Carlo baseada na variabilidade experimental dos dados, que contabiliza a frequência de ocorrência das diferentes composições na malha de referência."

// ==================== METODOLOGIA COMPLETA ====================
export const MethodologyComplete = () => (
  <>
    <h1 className="text-xl font-bold text-[#002060]">TRIAGEM HIDROALCOÓLICA</h1>
    
    <h2 className="text-lg font-bold text-[#002060] mt-6">Materiais necessários</h2>
    
    <h3 className="font-semibold text-[#002060] mt-3">Obrigatórios</h3>
    <p>Seringa de 20 mL, com graduação de 1 em 1 mL, com agulha 22G.</p>
    
    <h3 className="font-semibold text-[#002060] mt-3">Desejáveis</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Termômetro funcional para líquidos</li>
      <li>Balança, preferencialmente com resolução de 0,1 g; ou</li>
      <li>Densímetro; ou</li>
      <li>Alcôometro</li>
    </ul>
    <p className="text-gray-600 italic text-xs mt-2">
      Observação: A ausência de equipamentos desejáveis não impede a realização do exame de triagem, 
      desde que os requisitos metodológicos descritos a seguir sejam respeitados.
    </p>

    <h2 className="text-lg font-bold text-[#002060] mt-6">Avisos iniciais (leitura obrigatória)</h2>
    
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Importante — Leia antes de prosseguir</p>
      <div className="text-yellow-800 mt-2 space-y-2">
        <p>
          Esta ferramenta aplica-se exclusivamente à triagem de bebidas destiladas puras ("secas"), 
          etanol combustível, metanol reagente ou solução composta somente por água, etanol e metanol, 
          conforme opções listadas na etapa Medir.
        </p>
        <p>
          O método <strong>estima a composição</strong> em <strong>água</strong>, <strong>etanol</strong> e <strong>metanol</strong>, 
          quando presentes em teores iguais ou superiores a 5% m/m.
        </p>
        <p>
          Trata-se de uma ferramenta preventiva de triagem, desenvolvida para auxiliar na proteção 
          da saúde pública e defesa do consumidor.
        </p>
        <p>
          <strong>Não se trata de exame confirmatório e não substitui análises laboratoriais oficiais.</strong>
        </p>
        <p>
          Em casos suspeitos, <strong>NÃO CONSUMA a bebida</strong>, mesmo que os resultados de triagem 
          estejam dentro do esperado.
        </p>
      </div>
    </div>

    <h3 className="font-semibold text-[#002060] mt-4">Avisos de segurança e saúde</h3>
    <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2">
      <p className="font-semibold text-red-800">🚨 Suspeita de contaminação por metanol</p>
      <p className="text-red-800 mt-1">
        Procure serviço de saúde imediatamente.<br />
        Ligue para o Disque-Intoxicação: <strong>0800 722 6001</strong>.
      </p>
    </div>

    <h3 className="font-semibold text-[#002060] mt-4">Medidas preventivas recomendadas para bebidas</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Compre bebidas apenas de fornecedores confiáveis</li>
      <li>Confira o selo fiscal em destilados impressos pela Casa da Moeda</li>
      <li>Examine a integridade da embalagem</li>
      <li>Solicite ver a garrafa antes de pedir a dose</li>
      <li>Desconfie de preços muito abaixo do praticado no mercado</li>
    </ul>
    <p className="text-gray-600 italic mt-2 text-xs">
      Em casos suspeitos, denuncie: Vigilância Sanitária local, Polícia Civil (197), PROCON e, 
      quando aplicável, MAPA.
    </p>

    <hr className="my-6 border-gray-300" />

    <h1 className="text-xl font-bold text-[#002060]">METODOLOGIA - FLUXO MEDIR</h1>

    <div className="mt-6"><MethodologyTipoSolucao /></div>
    <div className="mt-6"><MethodologyDadosAmostra /></div>
    <div className="mt-6"><MethodologyMassaDensidade /></div>
    <div className="mt-6"><MethodologyTemperatura /></div>
    <div className="mt-6"><MethodologyEscoamento /></div>
    <div className="mt-6"><MethodologyRevisao /></div>
    <div className="mt-6"><MethodologyRelatorio /></div>
  </>
)
