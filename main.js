function normalize(node, idx, nodes) {
	const from = idx ? nodes[idx - 1].level : -1;
	const to = node.level;
	const results = [];
	for (let i = from + 1; i < to; i++) {
		results.push({ level: i });
	}
	results.push(node);
	return results;
}

function parse(text) {
	const nodes = [].concat(
		...text
			.split(/\r?\n/)
			.filter((line) => line.startsWith("#"))
			.map((line) => ({
				level: line.replace(/^(#+).*/, "$1").length - 1,
				text: line.replace(/^#+/, "").trim(),
			}))
			.map(normalize)
	);
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].children = nodes[i].children || [];
		for (let j = i - 1; j >= 0; j--) {
			if (nodes[j].level + 1 === nodes[i].level) {
				nodes[j].children.push(nodes[i]);
				break;
			}
		}
	}
	return nodes.filter((node) => !node.level);
}

function gen(nodes = [], level = 0, prefix = "") {
	return nodes.map((node, index) => {
		const isLast = index === nodes.length - 1;
		const line = level ? `${prefix}${isLast ? "└" : "├"}── ` : "";
		const nextPrefix = level ? `${prefix}${isLast ? "    " : "│   "}` : "";
		return [
			`${line}${node.text || ""}`,
			...gen(node.children, level + 1, nextPrefix),
		].join("\n");
	});
}

function render() {
	$output.textContent = gen(parse($input.value)).join("\n");
}

function selectText(containerid) {
	navigator.clipboard
		.writeText(document.getElementById(containerid).textContent)
		.then(
			function () {
				console.log("Copied to clipboard!");
			},
			function (err) {
				console.error("Could not copy to clipboard: ", err);
			}
		);
}

const $input = document.querySelector("#input");
const $output = document.querySelector("#output");

$input.addEventListener("input", render);

$input.value = `
              # the\n## quick\n### brown\n## fox\n## jumps\n### over\n#### the\n### lazy\n## dog
              `.trim();

render();
