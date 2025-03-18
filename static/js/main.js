
// static/js/main.js

// Insert initial sample texts on page load
window.onload = function() {
  document.getElementById("lowCheapText").value =
    "By 2030, we commit to reducing our carbon emissions by 50% through the implementation of solar energy, electric vehicle fleets, and energy-efficient manufacturing. We will invest $20 million in renewable energy projects to power 100% of our operations with clean energy by 2028.\n\nOur waste reduction initiative will cut landfill waste by 80% by optimizing supply chain logistics and switching to 100% biodegradable packaging by 2026. We will publish an annual Sustainability Impact Report detailing our progress on these commitments.";
  document.getElementById("highCheapText").value =
    "Our company is deeply committed to sustainability and environmental responsibility. We believe in setting ambitious goals to create a more eco-friendly future, and we promise to reduce our carbon footprint over time. We will actively explore various cutting-edge technologies and continue supporting global initiatives that align with our overarching sustainability objectives.";
};

// Copy text helper
function copyText(elementId) {
  const text = document.getElementById(elementId);
  text.select();
  document.execCommand("copy");
  
  const copiedMsg = document.createElement("div");
  copiedMsg.innerText = "Copied!";
  copiedMsg.style.position = "fixed";
  copiedMsg.style.top = "10px";
  copiedMsg.style.right = "10px";
  copiedMsg.style.padding = "8px";
  copiedMsg.style.color = "#fff";
  copiedMsg.style.backgroundColor = "#4a90e2";
  copiedMsg.style.borderRadius = "4px";
  document.body.appendChild(copiedMsg);

  setTimeout(() => {
    document.body.removeChild(copiedMsg);
  }, 1500);
}

// Analyze the text using your Flask `/analyze` route
function analyzeText() {
  const text = document.getElementById("textInput").value;

  fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("result").innerHTML =
          "<p style='color:red;'>Error: " + data.error + "</p>";
        return;
      }

      const cheapTalkScore = (data.cheap_talk_probability * 100).toFixed(1);
      const commitment = (data.commitment_probability * 100).toFixed(1);
      const specificity = (data.specificity_probability * 100).toFixed(1);

      let cheapLabel = "Low (Clear & Specific)";
      let cheapClass = "low";

      if (cheapTalkScore > 40) {
        cheapLabel = "Medium (Some Detail, Some Promises)";
        cheapClass = "medium";
      }
      if (cheapTalkScore > 70) {
        cheapLabel = "High (Bold Promises, No Detail)";
        cheapClass = "high";
      }

      const commitmentBar = `
        <div class="stat-label">Commitment Level</div>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${commitment}%;">
            ${commitment}%
          </div>
        </div>
      `;
      const specificityBar = `
        <div class="stat-label">Specificity Level</div>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${specificity}%;">
            ${specificity}%
          </div>
        </div>
      `;

      document.getElementById("result").innerHTML = `
        <div class="score-circle ${cheapClass}">${cheapTalkScore}%</div>
        <p><strong>Cheap Talk Score:</strong> ${cheapLabel}</p>
        <div class="stats">
          ${commitmentBar}
          ${specificityBar}
        </div>
      `;
    })
    .catch(error => {
      document.getElementById("result").innerHTML =
        "<p style='color:red;'>Error analyzing text.</p>";
      console.error("Error:", error);
    });
}
