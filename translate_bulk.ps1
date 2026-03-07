# Etapa 2 - Bulk Translation Script PT→EN
# Excludes: methodologyContent.tsx
$ErrorActionPreference = "Stop"
$root = "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_deploy_railway\src"
$count = 0

# Universal replacements across ALL .tsx/.ts files (except methodology)
$replacements = @(
    # --- Navigation/UI ---
    @('"Voltar"', '"Back"'),
    @('"Próximo"', '"Next"'),
    @('"Calcular"', '"Calculate"'),
    @('"Cancelar"', '"Cancel"'),
    @('"Prosseguir"', '"Proceed"'),
    @('"Entendi"', '"Understood"'),
    @('"Excluir"', '"Delete"'),
    @('"Editar"', '"Edit"'),
    @('"Salvar"', '"Save"'),
    @('>Voltar<', '>Back<'),
    @('>Próximo<', '>Next<'),
    @('>Calcular<', '>Calculate<'),
    @('>Cancelar<', '>Cancel<'),
    @('>Prosseguir<', '>Proceed<'),
    @('>Entendi<', '>Understood<'),
    @('>Excluir<', '>Delete<'),
    @('>Editar<', '>Edit<'),
    
    # --- StepProfile ---
    @('NAO_SE_APLICA', 'NOT_APPLICABLE'),
    @('Selecione{" "}', 'Select{" "}'),
    @('solução hidroalcoólica', 'hydroalcoholic solution'),
    @('Mistura composta predominantemente por água, etanol e/ou metanol.', 'Mixture composed predominantly of water, ethanol and/or methanol.'),
    @('Limpa apenas os dados das janelas analíticas do fluxo medir para início de uma nova análise. Em caso de reaproveitamento de escoamentos, você pode seguir sem limpar e substituir apenas os novos valores experimentais.', 'Clears only the analytical window data from the measurement flow to start a new analysis. If reusing flow data, you can proceed without clearing and only replace the new experimental values.'),
    @('Limpar - Nova análise', 'Clear - New analysis'),
    @('Não se aplica?', 'Not applicable?'),
    @('Esta metodologia NÃO se aplica a:', 'This methodology does NOT apply to:'),
    @('Licores e bebidas adoçadas', 'Liqueurs and sweetened beverages'),
    @('Cremes alcoólicos', 'Alcoholic creams'),
    @('Bebidas fermentadas (vinho, cerveja, sidra, hidromel)', 'Fermented beverages (wine, beer, cider, mead)'),
    @('Destilados saborizados', 'Flavored spirits'),
    @('Bebidas mistas e prontas (ex.: caipirinhas prontas)', 'Mixed and ready-to-drink beverages (e.g., pre-made cocktails)'),
    @('Bebidas turvas, com polpas, emulsões, óleos ou corantes densos', 'Turbid beverages with pulps, emulsions, oils or dense colorants'),
    @('Misturas caseiras não homogêneas (coquetéis)', 'Non-homogeneous homemade mixtures (cocktails)'),
    @('Busque marcas conhecidas e de qualidade reconhecida para obter melhores resultados de referência.', 'Look for well-known and quality-recognized brands for better reference results.'),
    @('lacrado pode ser utilizado como check para verificação se os resultados obtidos com seus instrumentos estão coerentes.', 'sealed can be used as a check to verify if results obtained with your instruments are consistent.'),
    @('Metodologia: Tipo de Solução', 'Methodology: Solution Type'),
    
    # --- StepSampleData ---
    @('Informe dados da amostra', 'Enter sample data'),
    @('Essas informações auxiliam na interpretação e organização dos resultados.', 'This information helps with interpretation and organization of results.'),
    @('Teor de rótulo', 'Label content'),
    @('teor de rótulo', 'label content'),
    @('Valor declarado pelo fabricante ou teor esperado pelo preparo.', 'Value declared by the manufacturer or expected content from preparation.'),
    @('Unidade do teor de rótulo', 'Label content unit'),
    @('% v/v - Bebidas: unidade oficial para bebidas destiladas no Brasil.', '% v/v - Beverages: official unit for distilled beverages in Brazil.'),
    @('>Selecione...</', '>Select...</'),
    @('Teor de etanol % m/m', 'Ethanol content % w/w'),
    @('Teor de metanol % m/m', 'Methanol content % w/w'),
    @('Teor de água % m/m', 'Water content % w/w'),
    @('Nome da amostra', 'Sample name'),
    @('Definido pelo usuário', 'User-defined'),
    @('Fabricante e/ou marca', 'Manufacturer and/or brand'),
    @('Opcional', 'Optional'),
    @('Campo opcional para rastreabilidade e facilitar localização posterior dos resultados.', 'Optional field for traceability and to facilitate later retrieval of results.'),
    @('Lote', 'Batch'),
    @('Metodologia: Dados da Amostra', 'Methodology: Sample Data'),
    
    # --- StepDensity ---
    @('Meça massa ou', 'Measure mass or'),
    @('Relação entre massa e volume do líquido.', 'Ratio between mass and volume of the liquid.'),
    @('Se for estimar a', 'To estimate'),
    @('por massa, selecione', 'by mass, select'),
    @('Caso contrário, a aba', 'Otherwise, the'),
    @('Densímetro, alcoômetro ou rótulo', 'Hydrometer, alcoholmeter or label'),
    @('Para as pesagens, aspire 20 mL de água e, separadamente, 20 mL da amostra,', 'For weighing, aspirate 20 mL of water and, separately, 20 mL of the sample,'),
    @('utilizando a mesma seringa e posicionando o êmbolo na mesma marcação em ambos os casos.', 'using the same syringe and positioning the plunger at the same mark in both cases.'),
    @('Uma pesagem para cada é suficiente para', 'A single weighing for each is sufficient for the'),
    @('estimativa inicial', 'initial estimate'),
    @('Utilizada apenas para localizarmos a faixa aproximada de teor alcoólico da amostra.', 'Used only to locate the approximate alcohol content range of the sample.'),
    @('da densidade. Recomenda-se uso de balança com pelo menos 1 casa decimal.', 'of the density. A scale with at least 1 decimal place is recommended.'),
    @('Recomenda-se medir também a massa do conjunto seringa com êmbolo e agulha.', 'It is also recommended to measure the mass of the syringe assembly with plunger and needle.'),
    @('Massa do conjunto (seringa, êmbolo, agulha) (g)', 'Assembly mass (syringe, plunger, needle) (g)'),
    @('Aplicar 0.0 se for inserir massa líquida nos campos abaixo', 'Enter 0.0 if inserting liquid mass in the fields below'),
    @('Massa água (g)', 'Water mass (g)'),
    @('Massa amostra (g)', 'Sample mass (g)'),
    @('Massas líquidas calculadas:', 'Calculated liquid masses:'),
    @('Água:', 'Water:'),
    @('Amostra:', 'Sample:'),
    @('Balança possui pelo menos uma casa decimal?', 'Does the scale have at least one decimal place?'),
    @('>Sim<', '>Yes<'),
    @('>Não<', '>No<'),
    @('Aguarde enquanto checo uns valores', 'Please wait while checking values'),
    @('Densidade ou teor alcoólico', 'Density or alcohol content'),
    @('Unidade', 'Unit'),
    @('Utilize recipiente cilíndrico, permitindo que o instrumento flutue sem tocar as paredes e o fundo.', 'Use a cylindrical container, allowing the instrument to float without touching the walls and bottom.'),
    @('Aguarde estabilização do instrumento antes da leitura.', 'Wait for instrument stabilization before reading.'),
    @('Metodologia: Massa ou Densidade', 'Methodology: Mass or Density'),
    
    # --- StepWaterTemp ---
    @('Meça as temperaturas', 'Measure the temperatures'),
    @('Tipo de água', 'Water type'),
    @('Possuo termômetro', 'I have a thermometer'),
    @('Não possuo termômetro', 'I do not have a thermometer'),
    @('Com termômetro, meça a temperatura imediatamente antes ou após o escoamento.', 'With a thermometer, measure the temperature immediately before or after the flow.'),
    @('Diferenças de até 3 °C entre água e amostra são aceitáveis; o aplicativo realiza', 'Differences of up to 3 °C between water and sample are acceptable; the app performs'),
    @('correção de viscosidade', 'viscosity correction'),
    @('Ajuste da viscosidade da água conforme a temperatura.', 'Adjustment of water viscosity according to temperature.'),
    @('Temperatura (°C)', 'Temperature (°C)'),
    @('Dois líquidos com temperaturas iguais (entre 20 e 28ºC)?', 'Both liquids at the same temperature (between 20 and 28°C)?'),
    @('Água, amostra e ambiente devem estar em', 'Water, sample and environment must be in'),
    @('equilíbrio térmico', 'thermal equilibrium'),
    @('Água, amostra e ambiente na mesma temperatura.', 'Water, sample and environment at the same temperature.'),
    @('Deixe os líquidos por pelo menos 1 hora no ambiente do ensaio e assegure que ele esteja entre 20 e 30°C.', 'Leave the liquids for at least 1 hour in the test environment and ensure it is between 20 and 30°C.'),
    @('Aguarde a estabilização!', 'Wait for stabilization!'),
    @('É recomendado aguardar pelo menos 1 hora com os recipientes em contato,', 'It is recommended to wait at least 1 hour with containers in contact,'),
    @('em um ambiente que sabidamente está entre 20 e 28ºC.', 'in an environment known to be between 20 and 28°C.'),
    @('Metodologia: Temperatura', 'Methodology: Temperature'),
    @('Diminuir temperatura', 'Decrease temperature'),
    @('Aumentar temperatura', 'Increase temperature'),
    
    # --- StepTimes ---
    @('Registre os tempos de escoamento', 'Record the flow times'),
    @('Cronômetro', 'Stopwatch'),
    @('>Disparar<', '>Start<'),
    @('>Parar<', '>Stop<'),
    @('Salvar tempo', 'Save time'),
    @('Descartar', 'Discard'),
    @('Atenção', 'Attention'),
    @('Metodologia: Escoamento', 'Methodology: Flow'),
    
    # --- StepReviewCalculate ---
    @('Revise antes de calcular', 'Review before calculating'),
    @('Se necessário, volte às janelas anteriores e corrija as informações e os valores.', 'If needed, go back to previous windows and correct the information and values.'),
    @('Perfil da Amostra', 'Sample Profile'),
    @('Tipo:', 'Type:'),
    @('Nome:', 'Name:'),
    @('Etanol:', 'Ethanol:'),
    @('Metanol:', 'Methanol:'),
    @('Fabricante/Marca:', 'Manufacturer/Brand:'),
    @('Água e Temperatura', 'Water and Temperature'),
    @('Tipo de água:', 'Water type:'),
    @('T água:', 'T water:'),
    @('T amostra:', 'T sample:'),
    @('Não medida', 'Not measured'),
    @('Massa / Densidade', 'Mass / Density'),
    @('Método:', 'Method:'),
    @('Massa água:', 'Water mass:'),
    @('Massa amostra:', 'Sample mass:'),
    @('Valor medido:', 'Measured value:'),
    @('Escoamentos', 'Flows'),
    @('Metodologia: Revisão', 'Methodology: Review'),
    
    # --- schemas.ts ---
    @('Selecione o tipo de bebida', 'Select the beverage type'),
    @('Selecione a unidade', 'Select the unit'),
    @('Selecione o tipo de água', 'Select the water type'),
    
    # --- General terms ---
    @('Teste com dados de exemplos reais', 'Try with real example data'),
    @('Modo demonstração', 'Demo mode'),
    @('análise', 'analysis'),
    @('Análise', 'Analysis')
)

$files = Get-ChildItem -Path $root -Recurse -Include "*.tsx","*.ts" -Exclude "methodologyContent.tsx"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    $original = $content
    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $count++
        Write-Output "Updated: $($file.Name)"
    }
}
Write-Output "Total files updated: $count"
