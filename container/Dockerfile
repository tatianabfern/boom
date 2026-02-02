FROM fedora:43

# Install necessary packages
RUN dnf -y update && dnf install -y \
  git \
  sudo \
  python \
  python-flask \
  python-bcrypt \
  curl \
  vim \
  openssl \
  bc \
  && dnf clean all

ARG USERNAME=boom-dev
RUN groupadd -g 1000 ${USERNAME} \
    && useradd -m -u 1000 -g 1000 -s /bin/bash ${USERNAME} \
    && usermod -aG wheel ${USERNAME} \
    && passwd -d ${USERNAME} || true
RUN echo '%wheel ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/90-wheel-nopasswd \
    && chmod 0440 /etc/sudoers.d/90-wheel-nopasswd
COPY --chown=root:root ./container/.containerrc /etc/profile.d/boomsourcer.sh

USER ${USERNAME}
RUN mkdir /home/${USERNAME}/.config
WORKDIR /home/${USERNAME}/.config
# Copy current repo
COPY --chown=${USERNAME}:${USERNAME} . boom
WORKDIR /home/${USERNAME}/.config/boom
RUN bash .boominstaller.bash skippermcheck <<<"y"
RUN bash .siteconfig.bash <<<"y"
# Host site on 5252 in container
RUN sed -i 's/\(BOOMPORT="\)[0-9]\+/\15252/' ~/.local/share/boom/.boomconfig
RUN sed -i 's|\(BOOMSITE="\)[^"]\+|\1http://localhost:5252|' ~/.local/share/boom/.boomconfig
RUN sed -i "\|BOOMPORT| s|\"9029\"|\"5252\"|" ~/.local/share/boom/.boomserver/.boombackend.py
RUN bash -lic "boom zone summary"
WORKDIR /home/${USERNAME}/.local/share/boom/.boomserver

CMD ["python3", ".boombackend.py"]

