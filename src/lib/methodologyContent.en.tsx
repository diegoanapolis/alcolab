// Methodology content — English version
// Each section corresponds to a step in the Measure flow

import React from "react"

// ==================== SECTION 1: SOLUTION TYPE ====================
export const MethodologyTipoSolucao_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">1️⃣ Select the hydroalcoholic solution type</h3>
    
    <p>
      This methodology was structured, calibrated and tested exclusively for screening analysis 
      of hydroalcoholic solutions whose composition is predominantly (&gt;99.5%) composed of:
    </p>
    
    <ul className="list-disc pl-5 space-y-1">
      <li>Water</li>
      <li>Ethanol</li>
      <li>Methanol</li>
    </ul>
    
    <p>
      Other constituents are only acceptable at trace levels, below 0.5% w/w, 
      and must not interfere with the physical properties of the system.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Supported applications</h4>
    <p>The following are compatible with this methodology:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Pure distilled beverages ("dry") listed in the application</li>
      <li>Fuel ethanol</li>
      <li>Commercial ethanol</li>
      <li>Methanol</li>
      <li>Other hydroalcoholic solutions prepared or acquired, provided they contain exclusively water, ethanol and/or methanol, in high purities</li>
    </ul>

    <h4 className="font-semibold text-red-700 mt-4">🚫 Does NOT apply to the following cases</h4>
    <ul className="list-disc pl-5 space-y-1 text-red-700">
      <li>Liqueurs and sweetened beverages</li>
      <li>Alcoholic creams</li>
      <li>Fermented beverages (wine, beer, cider, mead)</li>
      <li>Flavored spirits</li>
      <li>Mixed and ready-to-drink beverages (e.g., pre-made cocktails)</li>
      <li>Turbid beverages with pulps, emulsions, oils or dense colorants</li>
      <li>Non-homogeneous homemade mixtures (cocktails)</li>
    </ul>
  </>
)

// ==================== SECTION 2: SAMPLE DATA ====================
export const MethodologyDadosAmostra_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">2️⃣ Enter sample data</h3>
    
    <p>
      In this step, descriptive data about the sample is entered, which helps with interpretation 
      of results and organization of analyses within the application.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Requested fields (beverages in general)</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Content indicated on the label (0.0 to 100.0)</li>
      <li>Label content unit</li>
      <li>Sample name</li>
      <li>Manufacturer and/or brand (optional)</li>
      <li>Batch (optional)</li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Other hydroalcoholic solutions</h4>
    <p>The expected methanol content may also be requested.</p>

    <h4 className="font-semibold text-[#002060] mt-4">Important guidelines</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li>
        The label content or expected content is used to verify compatibility 
        between analytical results and the declared information.
      </li>
      <li>
        For distilled beverages marketed in Brazil, in the absence of explicit indication, 
        consider "% v/v – Beverages" as the default unit, following regulatory practice.
      </li>
      <li>
        Information such as manufacturer, brand and batch is optional, but facilitates 
        location, filtering and comparison of analyses in the application's history.
      </li>
    </ul>
  </>
)

// ==================== SECTION 3: MASS OR DENSITY ====================
export const MethodologyMassaDensidade_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">3️⃣ Measure mass or density</h3>
    
    <p>
      In this step, the user can choose between different methods, in order to enable 
      the examination even with limited equipment (only the specified syringe being mandatory).
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Method 1 — Mass measurement (Scale)</h4>
    
    <p className="font-medium mt-2">Procedure:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Aspirate exactly 20 mL of water for weighing and, separately, 20 mL of the sample, using the same syringe.</li>
      <li>Position the plunger at exactly the same mark in both cases.</li>
      <li>Perform a single weighing, as the mass will only be used for initial density estimation.</li>
      <li>The refined composition estimate will be obtained primarily from the flow (viscosity).</li>
    </ul>

    <p className="font-medium mt-3">Important notes:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>It is not necessary for the syringe graduation to be absolutely exact, as the methodology works in relative terms to water, which is the system's reference.</li>
      <li>If the syringe mass is subtracted externally, you can enter syringe mass = 0 in the application.</li>
      <li>It is recommended to weigh the empty, dry and complete syringe (syringe + plunger + needle), as domestic scales may lose their tare automatically.</li>
    </ul>

    <p className="font-medium mt-3">Practical care:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Use a dry syringe.</li>
      <li>If there is doubt about internal moisture, rinse the inside of the syringe twice with two small portions of the liquid to be measured.</li>
      <li>To remove bubbles:
        <ul className="list-disc pl-5 space-y-0.5 mt-1">
          <li>Aspirate a volume slightly above 20 mL</li>
          <li>With the needle attached and pointing upward, press the plunger slowly to eliminate visible bubbles</li>
          <li>Repeat the procedure if necessary</li>
        </ul>
      </li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Method 2 — Hydrometer, alcoholmeter or label</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Use a cylindrical container, allowing the instrument to float without touching the walls.</li>
      <li>Wait for instrument stabilization before reading.</li>
    </ul>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Warning — use of label content</p>
      <p className="text-yellow-800 mt-1">
        Using the label content reduces the selectivity of the analysis. In this case, the examination 
        simply works as a compatibility check between the declared content and the flow behavior 
        (viscosity), not excluding other possible hydroalcoholic compositions 
        (including those containing methanol).
      </p>
    </div>
  </>
)

// ==================== SECTION 4: TEMPERATURE ====================
export const MethodologyTemperatura_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">4️⃣ Measure the temperature — water and sample</h3>

    <h4 className="font-semibold text-[#002060] mt-4">Option 1 — I have a thermometer</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Measure the temperature immediately before or after the flow.</li>
      <li>It is recommended to measure in a plastic container, e.g., a clean cup or the flow discharge collection container.</li>
      <li>Differences of up to 3 °C between water and sample are acceptable; the application corrects the water viscosity.</li>
      <li>If you choose to measure after the flow: proceed normally in the app flow; then return to the temperature screen and update the values. Flow data will be preserved.</li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">Option 2 — No thermometer</h4>
    <p>
      It is possible to perform the examination without direct temperature measurement, provided that:
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Water, sample and environment are in thermal equilibrium</li>
      <li>None of the samples has been refrigerated</li>
      <li>A minimum of 1 hour is waited in the test environment</li>
      <li>The environment must be between 20 and 30 °C</li>
    </ul>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Warning</p>
      <p className="text-yellow-800 mt-1">
        If any sample was refrigerated, longer equalization times will be necessary. 
        Non-compliance with this requirement will result in analytical error.
      </p>
    </div>

    <p className="text-gray-600 italic mt-3 text-xs">
      Note: The absence of direct measurement, when the above criteria are met, does not reduce the quality 
      of the examination, as the measured viscosity is always normalized to 20 °C based on reference data 
      (a procedure that is independent of the actual temperature, as long as it is within the 20 to 30°C range).
    </p>
  </>
)

// ==================== SECTION 5: FLOW ====================
export const MethodologyEscoamento_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">5️⃣ Record the flow</h3>
    
    <p>
      This is the most sensitive step of the methodology, responsible for the fine-tuning of the 
      composition estimate, based on the physical principles of flow and viscosity.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Available methods</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Video estimation of times between 18 mL and 13 mL (most recommended)</li>
      <li>Manual entry of total flow times (less recommended)</li>
    </ul>

    <p className="font-bold text-[#002060] mt-3">
      Reminder: Always use the same syringe + needle (22G) set for water and sample.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">General guidelines</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li>Consider the bottom of the curved liquid surface (called meniscus) as the reference when identifying when it touches each graduation mark on the syringe.</li>
      <li>Small differences in meniscus interpretation between different users do not compromise the result, as long as the user applies the same criterion for water and sample.</li>
      <li>Water and sample should be flowed through the same physical set, preferably on the same day, and without removing the needle between measurements (there are indications that detaching and reattaching may slightly alter flow dynamics).</li>
    </ul>

    <p className="text-gray-600 italic mt-2 text-xs">
      Operational recommendation: For multiple samples on the same day, use one syringe dedicated 
      to weighing water and samples, and another dedicated exclusively to flows.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">Practical execution care</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Fix the syringe without plunger, with the needle attached, in a vertical position.</li>
      <li>Use a smooth background.</li>
      <li>Position the phone parallel to the syringe with the camera at the height of the syringe body, approximately 50 cm away.</li>
      <li>If possible, lock the camera focus on the syringe body.</li>
      <li>Start recording before the meniscus reaches 18 mL and finish after it passes 13 mL.</li>
    </ul>

    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3">
      <p className="font-semibold text-blue-800">💡 Tip for syringe fixation</p>
      <p className="text-blue-800 mt-1">
        Use a small plastic bottle with two openings cut on opposite sides of the upper part, 
        to allow viewing of the syringe graduation. The uncut portion should keep the nozzle, 
        where the syringe can be positioned and fixed by the tabs.
      </p>
    </div>

    <h4 className="font-semibold text-[#002060] mt-4">Manual entry (less recommended)</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>Position your eyes aligned (at the height) of the initial 18 mL mark when triggering the stopwatch, and aligned with the 14 mL mark when stopping the time count</li>
      <li>Start and stop the stopwatch exactly at the moments the meniscus contacts the marks</li>
      <li>Preferably use the application's own stopwatch, which already measures in elapsed seconds</li>
    </ul>

    <p className="font-bold text-[#002060] mt-3">
      Repetitions: A minimum of two repetitions for water and two for sample is recommended. 
      The application allows analysis with only one repetition, but with lower statistical reliability.
    </p>
  </>
)

// ==================== SECTION 6: REVIEW ====================
export const MethodologyRevisao_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">6️⃣ Review the data before calculation</h3>
    
    <p>
      This step allows the final verification of all experimental and informational data 
      before processing the results.
    </p>
    
    <p>
      If any inconsistency is identified, use the application's back arrow for correction.
    </p>
    
    <p>After confirmation, the calculation will be performed.</p>
  </>
)

// ==================== SECTION 7: REPORT ====================
export const MethodologyRelatorio_EN = () => (
  <>
    <h3 className="font-bold text-[#002060] text-base">7️⃣ Report | Screening Examination</h3>
    
    <p>
      This screen presents the consolidated analytical result of the screening examination, including:
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Experimental data used</li>
      <li>Statistically equivalent compositions obtained</li>
      <li>Most likely composition</li>
      <li>Interpretive synthesis of results</li>
      <li>Warnings and method limitations</li>
    </ul>

    <h4 className="font-semibold text-[#002060] mt-4">About equivalent compositions</h4>
    <p>
      ℹ️ Equivalent compositions correspond to possibilities that, considering the experimental 
      variability and the applied statistical tests (Z-test and Monte Carlo simulations), 
      cannot be distinguished from each other. In other words, these are different compositions 
      that could lead to the obtained experimental results.
    </p>

    <h4 className="font-semibold text-[#002060] mt-4">About low reported contents</h4>
    <p>
      ℹ️ Contents below 5% tend to have reduced relevance in the interpretation of results, 
      since this methodology has not demonstrated adequate sensitivity for detecting 
      concentrations below this limit.
    </p>

    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Remember</p>
      <p className="text-yellow-800 mt-1">
        This examination is not confirmatory and does not replace official laboratory analyses.
        In suspicious cases, DO NOT CONSUME the beverage, even with apparently normal results.
      </p>
    </div>
  </>
)

// ==================== TOOLTIPS FOR RESULTS ====================
export const TooltipComposicoesEquivalentes_EN = "Equivalent compositions correspond to possibilities that, considering the experimental variability of the tests and the applied statistical tests (Z-test and Monte Carlo simulations), cannot be distinguished from each other. In other words, these are different compositions that could lead to the obtained experimental results."

export const TooltipTeoresBaixos_EN = "Contents below 5% tend to have reduced relevance in the interpretation of results, since this methodology has not demonstrated adequate sensitivity for detecting concentrations below this limit."

export const TooltipMonteCarlo_EN = "Probabilistic Monte Carlo simulation based on the experimental variability of the data, which counts the frequency of occurrence of different compositions in the reference mesh."

// ==================== COMPLETE METHODOLOGY ====================
export const MethodologyComplete_EN = () => (
  <>
    <h1 className="text-xl font-bold text-[#002060]">HYDROALCOHOLIC SCREENING</h1>
    
    <h2 className="text-lg font-bold text-[#002060] mt-6">Required materials</h2>
    
    <h3 className="font-semibold text-[#002060] mt-3">Mandatory</h3>
    <p>20 mL syringe, with 1 mL graduation, with 22G needle.</p>
    
    <h3 className="font-semibold text-[#002060] mt-3">Desirable</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Functional liquid thermometer</li>
      <li>Scale, preferably with 0.1 g resolution; or</li>
      <li>Hydrometer; or</li>
      <li>Alcoholmeter</li>
    </ul>
    <p className="text-gray-600 italic text-xs mt-2">
      Note: The absence of desirable equipment does not prevent performing the screening examination, 
      as long as the methodological requirements described below are followed.
    </p>

    <h2 className="text-lg font-bold text-[#002060] mt-6">Initial warnings (mandatory reading)</h2>
    
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-3">
      <p className="font-semibold text-yellow-800">⚠️ Important — Read before proceeding</p>
      <div className="text-yellow-800 mt-2 space-y-2">
        <p>
          This tool applies exclusively to screening of pure distilled beverages ("dry"), 
          fuel ethanol, reagent methanol or solutions composed solely of water, ethanol and methanol, 
          as per options listed in the Measure step.
        </p>
        <p>
          The method <strong>estimates the composition</strong> in <strong>water</strong>, <strong>ethanol</strong> and <strong>methanol</strong>, 
          when present at levels equal to or above 5% w/w.
        </p>
        <p>
          This is a preventive screening tool, developed to support public health 
          protection and consumer safety.
        </p>
        <p>
          <strong>This is not a confirmatory examination and does not replace official laboratory analyses.</strong>
        </p>
        <p>
          In suspicious cases, <strong>DO NOT CONSUME the beverage</strong>, even if screening results 
          are within expected range.
        </p>
      </div>
    </div>

    <h3 className="font-semibold text-[#002060] mt-4">Safety and health warnings</h3>
    <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2">
      <p className="font-semibold text-red-800">🚨 Suspected methanol contamination</p>
      <p className="text-red-800 mt-1">
        Seek medical help immediately.<br />
        Contact your country's poison control center. In Brazil: Disque-Intoxicação <strong>0800 722 6001</strong>.
      </p>
    </div>

    <h3 className="font-semibold text-[#002060] mt-4">Recommended preventive measures for beverages</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Buy beverages only from trusted suppliers</li>
      <li>Check the tax seal on spirits printed by the national mint</li>
      <li>Examine the packaging integrity</li>
      <li>Ask to see the bottle before ordering a drink</li>
      <li>Be suspicious of prices well below market average</li>
    </ul>
    <p className="text-gray-600 italic mt-2 text-xs">
      In suspicious cases, report to health surveillance authorities, police and consumer protection agencies.
    </p>

    <hr className="my-6 border-gray-300" />

    <h1 className="text-xl font-bold text-[#002060]">METHODOLOGY - MEASURE FLOW</h1>

    <div className="mt-6"><MethodologyTipoSolucao_EN /></div>
    <div className="mt-6"><MethodologyDadosAmostra_EN /></div>
    <div className="mt-6"><MethodologyMassaDensidade_EN /></div>
    <div className="mt-6"><MethodologyTemperatura_EN /></div>
    <div className="mt-6"><MethodologyEscoamento_EN /></div>
    <div className="mt-6"><MethodologyRevisao_EN /></div>
    <div className="mt-6"><MethodologyRelatorio_EN /></div>
  </>
)
