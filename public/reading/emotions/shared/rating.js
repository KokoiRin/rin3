for (const options of document.querySelectorAll('.rating-options')) {
  const emotion = options.dataset.emotion;

  for (let score = 0; score <= 6; score += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(score);
    button.setAttribute('aria-label', `${emotion} ${score} 分`);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      for (const peer of options.querySelectorAll('button')) {
        peer.classList.remove('selected');
        peer.setAttribute('aria-pressed', 'false');
      }
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
    });
    options.append(button);
  }
}
