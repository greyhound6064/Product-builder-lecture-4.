document.addEventListener('DOMContentLoaded', () => {
    // Lucide 아이콘 초기화
    lucide.createIcons();

    // 각 포스트 캡션을 확인하여 "더 보기" 버튼 표시 여부 결정
    document.querySelectorAll('.post-caption').forEach(caption => {
        const textSpan = caption.querySelector('span');
        const moreButton = caption.querySelector('.more-btn');

        // 텍스트가 잘렸는지 (scrollHeight가 clientHeight보다 큰지) 확인
        if (textSpan.scrollHeight <= textSpan.clientHeight) {
            // 텍스트가 잘리지 않았으면 버튼을 숨김
            moreButton.style.display = 'none';
        }

        // "더 보기" 버튼 클릭 이벤트 리스너
        moreButton.addEventListener('click', (event) => {
            caption.classList.add('expanded');
            event.target.style.display = 'none';
        });
    });
});
