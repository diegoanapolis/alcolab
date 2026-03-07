import os, sys

BASE = r"C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_deploy_railway\src"
EXCLUDE = ["methodologyContent.tsx"]

# Master replacement map: Portuguese → English (only for user-visible and comment text)
REPLACEMENTS = {
    # StepDensity remaining
    "Falha ao carregar tabela de conversão": "Failed to load conversion table",
    "Não foi possível calcular o": "Could not calculate the",
    "As massas informadas sugerem inicialmente": "The entered masses initially suggest",
    "As massas informadas indicam um": "The entered masses indicate an",
    "teor alcoólico de cerca de": "alcohol content of approximately",
    "alcohol content inicial de cerca de": "alcohol content of approximately",
    "Considerando a incerteza típica de balanças desse tipo (± 0,5 g), o": "Considering the typical uncertainty of this type of scale (± 0.5 g), the",
    "alcohol content da amostra pode estar entre": "sample alcohol content may be between",
    "Como o label content está dentro desse intervalo, ainda que muito largo, a análise pode prosseguir, **porém com menor seletividade**. Nesse caso, considera-se um intervalo contido no previous e mais estreito em torno do teor do rótulo.": "Since the label content is within this range, even if very wide, the analysis can proceed, **but with lower selectivity**. In this case, a narrower interval around the label content is considered.",
    "balança com pelo menos uma casa decimal** ou **com um densímetro": "scale with at least one decimal place** or **with a hydrometer",
    "**Inconsistency between density e label content** que, em conjunto com a baixa sensibilidade da balança, **impede a análise de avançar**.": "**Inconsistency between density and label content** which, combined with the low scale sensitivity, **prevents the analysis from proceeding**.",
    "Considerando as massas informadas e variações máximas em cada pesagem (± 0,5 g), obtivemos": "Considering the entered masses and maximum variations per weighing (± 0.5 g), we obtained an",
    "alcohol content inicial de": "initial alcohol content of",
    "e um intervalo possível entre": "and a possible range between",
    "Como o label content não se encontra dentro desse intervalo e a sensibilidade das pesagens é insuficiente para restringir a faixa estimada, recomenda-se **repetir as pesagens com uma balança com pelo menos uma casa decimal** ou **utilizar um densímetro**.": "Since the label content is not within this range and the weighing sensitivity is insufficient to narrow the estimated range, it is recommended to **repeat the weighings with a scale with at least one decimal place** or **use a hydrometer**.",
    "Considerando a incerteza típica de balanças sem casa decimal (± 0,5 g), o": "Considering the typical uncertainty of scales without a decimal place (± 0.5 g), the",
    "alcohol content pode estar entre": "alcohol content may be between",
    "Para maior confiabilidade, recomenda-se usar uma balança com pelo menos uma casa decimal.": "For greater reliability, it is recommended to use a scale with at least one decimal place.",
    "% v/v - rótulo": "% v/v - label",
    "g/mL ou g/cm³": "g/mL or g/cm³",
    "% v/v ou °GL": "% v/v or °GL",
    "% m/m ou INPM": "% w/w or INPM",
    "INPM ou % m/m": "INPM or % w/w",
    "Densímetro, alcôometro ou rótulo": "Hydrometer, alcoholmeter or label",
    "O uso do label content reduz a seletividade da análise.": "Using label content reduces analysis selectivity.",
    "Passa a funcionar como checagem de compatibilidade entre o teor declarado e o escoamento experimental": "It works as a compatibility check between the declared content and the experimental flow",
    "(viscosidade). Em muitos casos, não exclui a possibilidade de outras composições hidroalcoólicas.": "(viscosity). In many cases, it does not exclude other hydroalcoholic compositions.",
    "da density. Recomenda-se uso de balança com pelo menos 1 casa decimal.": "of density. A scale with at least 1 decimal place is recommended.",
    "Selecione...": "Select...",
    "Erro ao verificar compatibilidade. Tente novamente.": "Error checking compatibility. Try again.",
    "Massas líquidas devem ser positivas. Verifique os valores informados.": "Liquid masses must be positive. Check the values entered.",
    # UI texts across multiple files
    "Balança possui pelo menos uma casa decimal?": "Does the scale have at least one decimal place?",
    "Aguarde enquanto checo uns valores": "Please wait while checking values",
    "Utilize recipiente cilíndrico, permitindo que o instrumento flutue sem tocar as paredes e o fundo.": "Use a cylindrical container, allowing the instrument to float without touching the walls or bottom.",
    "Aguarde estabilização do instrumento antes da leitura.": "Wait for instrument stabilization before reading.",
    "Densidade ou teor alcoólico": "Density or alcohol content",
    "Meça massa ou": "Measure mass or",
    "Se for estimar a": "To estimate",
    "por massa, selecione": "by mass, select",
    "Caso contrário, a aba": "Otherwise, use the",
    "Para as pesagens, aspire 20 mL de água e, separadamente, 20 mL da amostra": "For weighing, aspirate 20 mL of water and, separately, 20 mL of the sample",
    "utilizando a mesma seringa e posicionando o êmbolo na mesma marcação em ambos os casos.": "using the same syringe and positioning the plunger at the same mark in both cases.",
    "Uma pesagem para cada é suficiente para": "One weighing for each is sufficient for the",
    "estimativa inicial": "initial estimate",
    "Utilizada apenas para localizarmos a faixa aproximada de teor alcoólico da amostra.": "Used only to find the approximate alcohol content range of the sample.",
    "Recomenda-se medir também a massa do conjunto seringa com êmbolo e agulha.": "It is also recommended to measure the mass of the syringe with plunger and needle assembly.",
    "Massa do conjunto (seringa, êmbolo, agulha) (g)": "Assembly mass (syringe, plunger, needle) (g)",
    "Aplicar 0.0 se for inserir massa líquida nos campos abaixo": "Enter 0.0 if entering liquid mass in the fields below",
    "Massa água (g)": "Water mass (g)",
    "Massa amostra (g)": "Sample mass (g)",
    "Massas líquidas calculadas:": "Calculated liquid masses:",
    "Relação entre massa e volume do líquido.": "Ratio between mass and volume of the liquid.",
    # StepWaterTemp
    "Meça as temperaturas": "Measure the temperatures",
    "Possuo termômetro": "I have a thermometer",
    "Não possuo termômetro": "No thermometer",
    "equilíbrio térmico": "thermal equilibrium",
    "Água, amostra e ambiente na mesma temperatura.": "Water, sample and environment at the same temperature.",
    "Tipo de água": "Water type",
    "Diminuir temperatura": "Decrease temperature",
    "Aumentar temperatura": "Increase temperature",
    "Aguarde a estabilização!": "Wait for stabilization!",
    "correção de viscosidade": "viscosity correction",
    "Ajuste da viscosidade da água conforme a temperatura.": "Adjustment of water viscosity according to temperature.",
    # StepSampleData  
    "Informe dados da amostra": "Enter sample data",
    "Essas informações auxiliam na interpretação e organização dos resultados.": "This information helps with interpretation and organization of results.",
    "Valor declarado pelo fabricante ou teor esperado pelo preparo.": "Value declared by the manufacturer or expected content from preparation.",
    "Teor de rótulo": "Label content",
    "teor de rótulo": "label content",
    "Unidade do teor de rótulo": "Label content unit",
    "Teor de etanol % m/m *": "Ethanol content % w/w *",
    "Teor de metanol % m/m *": "Methanol content % w/w *",
    "Teor de água % m/m": "Water content % w/w",
    "Nome da amostra": "Sample name",
    "Definido pelo usuário": "User-defined",
    "Fabricante e/ou marca": "Manufacturer and/or brand",
    "Opcional": "Optional",
    # Results page
    "Processando análise...": "Processing analysis...",
    "Nova análise": "New analysis",
    "Viscosidade da amostra": "Sample viscosity",
    "Viscosidade da água": "Water viscosity",
    "não substitui análise laboratorial confirmatória": "does not replace confirmatory laboratory analysis",
    "Composição esperada": "Expected composition",
    "Composição mais provável": "Most likely composition",
    "Dados experimentais": "Experimental data",
    # AnalysisListPage
    "Análises anteriores": "Previous analyses",
    "Nenhuma análise salva": "No saved analyses",
    "Realize uma análise": "Perform an analysis",
    "Exportar banco": "Export database",
    "Importar banco": "Import database",
    "Excluir tudo": "Delete all",
    "Tem certeza": "Are you sure",
    "Importado com sucesso": "Imported successfully",
    "Erro ao importar": "Error importing",
}

count = 0
for root, dirs, files in os.walk(BASE):
    for fn in files:
        if not fn.endswith(('.tsx', '.ts')): continue
        if fn in EXCLUDE: continue
        if fn.endswith('.d.ts'): continue
        fp = os.path.join(root, fn)
        # Skip landing pages
        if '\\pt\\' in fp or '\\en\\' in fp: continue
        
        with open(fp, 'r', encoding='utf-8') as f:
            original = f.read()
        
        modified = original
        for pt, en in REPLACEMENTS.items():
            modified = modified.replace(pt, en)
        
        if modified != original:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(modified)
            count += 1
            print(f"Updated: {fn}")

print(f"\nTotal files updated: {count}")
